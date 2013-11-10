import collections
import config
import flask
import json
import random
import MySQLdb as mysql
import MySQLdb.cursors


RANDOM_COMMIT_SQL = '''
SELECT *
FROM commit
  JOIN (SELECT (RAND() * (
      SELECT MAX(order_id) FROM commit)) AS value) AS random
WHERE commit.order_id %s random.value
  AND commit.grade > %d AND commit.grade <= %d
ORDER BY commit.order_id ASC
LIMIT 1'''


APP = flask.Flask(__name__, static_folder='../app', static_url_path='')
DB = mysql.connect(
    host=config.DB_HOST,
    user=config.DB_USER,
    passwd=config.DB_PASSWORD,
    db=config.DB_NAME,
    cursorclass=MySQLdb.cursors.DictCursor)


def load_repos():
  cursor = DB.cursor()
  cursor.execute('SELECT * FROM repository')
  first_row = cursor.fetchone()
  repo_class = collections.namedtuple('Repository', ' '.join(first_row.keys()))
  result = {}
  result[first_row['name']] = repo_class(**first_row)
  for row in cursor.fetchall():
    result[row['name']] = repo_class(**row)

  return result


# Assume we have enough memory to keep all repositories loaded.
REPOS = load_repos()
REPO_NAMES = REPOS.keys()


@APP.route("/")
def homepage():
  return open('../app/index.html', 'r').read();

def get_round(grade_lower_bound, grade_upper_bound):
  cursor = DB.cursor()
  if not cursor.execute(RANDOM_COMMIT_SQL % ('>=', grade_lower_bound, grade_upper_bound)):
    cursor.execute(RANDOM_COMMIT_SQL % ('<', grade_lower_bound, grade_upper_bound))
  commit = cursor.fetchone()
  repo_names = random.sample(REPO_NAMES, 4)
  if commit['repository'] not in repo_names:
    repo_names = repo_names[:3] + [commit['repository']]
  repos = [REPOS[i]._asdict() for i in repo_names]

  return {
    'commit': commit,
    'repos': repos
  }

@APP.route("/level/<length>/<grade_lower_bound>/<grade_upper_bound>")
def level(length, grade_lower_bound, grade_upper_bound):
  length = int(length)
  grade_upper_bound = int(grade_upper_bound)
  grade_lower_bound = int(grade_lower_bound)

  level_rounds = []
  for i in range(0, length):
    level_rounds.append(get_round(grade_lower_bound, grade_upper_bound))

  return flask.Response(json.dumps({
    'rounds': level_rounds
  }), mimetype='text/json')


if __name__ == "__main__":
  APP.run(debug=True)

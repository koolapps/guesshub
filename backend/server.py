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


RANDOM_REPOS_SQL = '''
SELECT *
FROM repository
  JOIN (SELECT (RAND() * (
      SELECT MAX(order_id) FROM repository)) AS value) AS random
WHERE repository.order_id >= random.value
ORDER BY repository.order_id ASC
LIMIT 4'''


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
def hello():
  return open('../app/index.html', 'r').read();


ROUNDS_PER_LEVEL = 10
NUMBER_LEVELS = 10
NUMBER_GRADES = 50
GRADES_PER_LEVEL =  NUMBER_GRADES / NUMBER_LEVELS

def get_round(level):
  cursor = DB.cursor()
  level = int(level)
  grade_upper_bound = level * GRADES_PER_LEVEL
  grade_lower_bound = grade_upper_bound - GRADES_PER_LEVEL
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

@APP.route("/level/<level>")
def level(level):
  level_rounds = []
  for i in range(0, ROUNDS_PER_LEVEL):
    level_rounds.append(get_round(level))

  return flask.Response(json.dumps({
    'rounds': level_rounds
  }), mimetype='text/json')


if __name__ == "__main__":
  APP.run(debug=True)

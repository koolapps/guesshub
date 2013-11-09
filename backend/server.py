import config
import flask
import json
import MySQLdb as mysql
import MySQLdb.cursors


RANDOM_COMMIT_SQL = '''
SELECT *
FROM commit
  JOIN (SELECT (RAND() * (
      SELECT MAX(order_id) FROM commit)) AS value) AS random
WHERE commit.order_id %s random.value
  AND commit.grade >= 0
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


@APP.route("/")
def hello():
  return open('../app/index.html', 'r').read();


@APP.route("/commit")
def commit():
  cursor = DB.cursor()
  if not cursor.execute(RANDOM_COMMIT_SQL % '>='):
    cursor.execute(RANDOM_COMMIT_SQL % '<')
  commit = cursor.fetchone()
  cursor.execute(RANDOM_REPOS_SQL)
  repos = cursor.fetchall()
  repos = [repo for repo in repos if repo['name'] != commit['repository']][:3]
  cursor.execute('SELECT * FROM repository WHERE name = %s',
                 commit['repository'])
  repos.append(cursor.fetchone())
  return flask.Response(json.dumps({
    'commit': commit,
    'repos': repos
  }), mimetype='text/json')


if __name__ == "__main__":
  APP.run(debug=True)

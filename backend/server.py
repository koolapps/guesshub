import config
import flask
import json
import MySQLdb as mysql
import MySQLdb.cursors


RANDOM_SQL = '''
SELECT *
FROM %(table)s
  JOIN (SELECT (RAND() * (
      SELECT MAX(order_id) FROM %(table)s)) AS value) AS random
WHERE %(table)s.order_id >= random.value
ORDER BY %(table)s.order_id ASC
LIMIT %(limit)d'''


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
  cursor.execute(RANDOM_SQL % {'table': 'commit', 'limit': 1})
  commit = cursor.fetchone()
  cursor.execute(RANDOM_SQL % {'table': 'repository', 'limit': 4})
  repos = cursor.fetchall()
  repos = [repo for repo in repos if repo['name'] != commit['repository']][:3]
  cursor.execute('SELECT * FROM repository WHERE name = %s', commit['repository'])
  repos.append(cursor.fetchone())
  return flask.Response(json.dumps({
    'commit': commit,
    'repos': repos
  }), mimetype='text/json')


if __name__ == "__main__":
  APP.run(debug=True)

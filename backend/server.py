import config
import flask
import json
import MySQLdb as mysql


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
    db=config.DB_NAME)


@APP.route("/")
def hello():
  # TODO(max99x): Serve the client app here.
  return open('../app/index.html', 'r').read();


@APP.route("/commit")
def commit():
  try:
    # TODO(max99x): Switch to dictionaries.
    cursor = DB.cursor()
    cursor.execute(RANDOM_SQL % {'table': 'commit', 'limit': 1})
    commit = cursor.fetchone()
    cursor.execute(RANDOM_SQL % {'table': 'repository', 'limit': 4})
    repos = cursor.fetchall()
    repos = [i for i in repos if i[2] != commit[7]][:3]
    cursor.execute('SELECT * FROM repository WHERE name = %s', commit[7])
    repos.append(cursor.fetchone())
    return flask.Response(json.dumps({
      'commit': commit,
      'repos': repos
    }), mimetype='text/json')
  except Exception as e:
    print e
    raise e


if __name__ == "__main__":
  APP.run()

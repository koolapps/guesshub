import collections
import config
import flask
import json
import bisect
import random
import os
import mimetypes
import MySQLdb as mysql
import MySQLdb.cursors

APP = flask.Flask(__name__)

def connect_to_db():
  # TODO: Close DB connection.
  return mysql.connect(
      host=config.DB_HOST,
      user=config.DB_USER,
      passwd=config.DB_PASSWORD,
      db=config.DB_NAME,
      cursorclass=MySQLdb.cursors.DictCursor).cursor()


def initialize():
  cursor = connect_to_db()

  # Get all repositories.
  cursor.execute('SELECT * FROM repository')
  first_row = cursor.fetchone()
  repo_class = collections.namedtuple('Repository', ' '.join(first_row.keys()))
  repos = {}
  repos[first_row['name']] = repo_class(**first_row)
  for row in cursor.fetchall():
    repos[row['name']] = repo_class(**row)

  # Get a commit index.
  cursor.execute('SELECT grade, order_id '
                 'FROM commit WHERE grade >= 0 '
                 'ORDER BY GRADE')
  grades = []
  ids = []
  for commit in cursor.fetchall():
    grades.append(commit['grade'])
    ids.append(commit['order_id'])
  index_class = collections.namedtuple('Index', 'grades ids')
  commit_index = index_class(tuple(grades), tuple(ids))

  return repos, commit_index


# Assume we have enough memory to keep all repositories and a commit index loaded.
REPOS, COMMIT_INDEX = initialize()
REPO_NAMES = REPOS.keys()


@APP.route("/")
def homepage():
  return open('../app/index.html', 'r').read();


@APP.route("/level/<length>/<min_grade>/<max_grade>")
def level(length, min_grade, max_grade):
  length = int(length)
  max_grade = int(max_grade)
  min_grade = int(min_grade)

  start = bisect.bisect_left(COMMIT_INDEX.grades, min_grade)
  end = bisect.bisect_right(COMMIT_INDEX.grades, max_grade)
  ids = [COMMIT_INDEX.ids[i] for i in random.sample(xrange(start, end), length)]

  sql = 'SELECT * FROM commit WHERE order_id IN (%s)' % ','.join(map(str, ids))
  cursor = connect_to_db()
  cursor.execute(sql)

  levels = []
  for commit in cursor.fetchall():
    repo_names = random.sample(REPO_NAMES, 4)
    if commit['repository'] not in repo_names:
      repo_names = repo_names[:3] + [commit['repository']]
    repos = [REPOS[i]._asdict() for i in repo_names]
    random.shuffle(repos)
    levels.append({'commit': commit, 'repos': repos})

  return flask.Response(json.dumps({'rounds': levels}), mimetype='text/json')

# TODO: Support caching or go back to Flask's native static serving.
@APP.route('/<path:path>')
def custom_static(path):
  fs_path = os.path.join('../app', path)
  # TODO: Fix security bug allowing access to files outside the root folder.
  if os.path.exists(fs_path):
    mime = mimetypes.guess_type(fs_path)[0]
    return flask.Response(open(fs_path, 'rb'), mimetype=mime)
  else:
    return 'Not Found', 404


if __name__ == "__main__":
  APP.run(debug=True)

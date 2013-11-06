import config
import github
import model
import MySQLdb as mysql

# How many pages of commits to look at (100 per page).
PAGES = 1

# The maximum number of rows to insert at a time.
BATCH_SIZE = 10


def encode(row):
  """UTF8-encodes all strings in an iterable, returning a tuple."""
  return tuple([i.encode('utf8') if isinstance(i, unicode)
                else i for i in row])


def insert_repository(cursor, repo):
  """Inserts a Repository object into the database using a given cursor."""
  sql = 'REPLACE INTO repository VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)'
  row = (repo.id,
         repo.name,
         repo.author,
         repo.author_avatar_url,
         repo.description.encode('utf8'),
         repo.is_private,
         repo.is_fork,
         repo.watcher_count,
         repo.star_count)
  cursor.execute(sql, encode(row))


def insert_commit(cursor, commits):
  """Inserts a Commit object into the database using a given cursor."""
  sql = ('REPLACE INTO commit VALUES'
         '(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)')
  rows = []

  def flush():
    try:
      cursor.executemany(sql, rows)
    except Exception as e:
      print commits[0].repository, [commit.sha for commit in commits]
      raise e

  for commit in commits:
    rows.append(encode((commit.sha,
                        commit.patch_number,
                        commit.message,
                        commit.author_login,
                        commit.author_name,
                        commit.author_avatar_url,
                        commit.repository,
                        commit.file_contents_url,
                        None,  # file_contents
                        commit.filename,
                        commit.additions,
                        commit.deletions,
                        commit.old_start_line,
                        commit.new_start_line,
                        commit.block_name,
                        u'\n'.join(commit.diff_lines))))
    if len(rows) >= BATCH_SIZE:
      flush()
      rows = []
  if len(rows) > 0:
    flush()


def commit_exists(cursor, sha):
  """Returns whether at least one commit with a given exists in the database."""
  cursor.execute('SELECT COUNT(*) FROM commit WHERE sha = %s', sha)
  return cursor.fetchone()[0] > 0


def crawl():
  """Crawls the top repositories, collecting commits."""
  db = mysql.connect(
      host=config.DB_HOST,
      user=config.DB_USER,
      passwd=config.DB_PASSWORD,
      db=config.DB_NAME)
  cursor = db.cursor()
  gh = github.GitHub(
      config.GITHUB_CLIENT_ID,
      config.GITHUB_CLIENT_SECRET,
      config.CLIENT_USER_AGENT)

  try:
    for repo in gh.GetTopRepositories():
      print 'Starting repo ', repo.name
      insert_repository(cursor, repo)
      for commit_sha in gh.GetCommitsList(repo.name, PAGES):
        if commit_exists(cursor, commit_sha):
          print '  Skipping SHA ' + commit_sha
        else:
          # TODO(max99x): Log and skip errors.
          print '  Getting SHA ' + commit_sha, '->',
          commits = list(gh.GetCommits(repo.name, commit_sha))
          print '%d commit(s)' % len(commits)
          insert_commit(cursor, commits)
          yield
  finally:
    cursor.close()
    db.close()


def main():
  """Crawls the top repositories, collecting commits."""
  crawler = crawl()
  while True:
    crawler.next()


if __name__ == '__main__':
  main()

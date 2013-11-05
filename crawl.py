import config
import github
import model
import MySQLdb as mysql

# How many pages of commits to look at (100 per page).
PAGES = 1

# The maximum number of rows to insert at a time.
BATCH_SIZE = 10


def insert_repository(db, repo):
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
  db.execute(sql, row)


def insert_commit(db, commits):
  sql = ('REPLACE INTO commit VALUES'
         '(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)')
  rows = []
  for commit in commits:
    rows.append((commit.sha,
                 commit.patch_number,
                 commit.message.encode('utf8'),
                 commit.author_login,
                 commit.author_name and commit.author_name.encode('utf8'),
                 commit.author_avatar_url,
                 commit.repository,
                 commit.file_contents_url,
                 None,  # file_contents
                 commit.filename,
                 commit.additions,
                 commit.deletions,
                 commit.old_start_line,
                 commit.new_start_line,
                 commit.block_name and commit.block_name.encode('utf8'),
                 u'\n'.join(commit.diff_lines).encode('utf8')))
    if len(rows) >= BATCH_SIZE:
      try:
        db.executemany(sql, rows)
      except Exception as e:
        print commit.repository, [commit.sha for commit in commits]
        raise e
      rows = []

def crawl():
  db = mysql.connect(
      host=config.DB_HOST,
      user=config.DB_USER,
      passwd=config.DB_PASSWORD,
      db=config.DB_NAME).cursor()
  gh = github.GitHub(
      config.GITHUB_CLIENT_ID,
      config.GITHUB_CLIENT_SECRET,
      config.CLIENT_USER_AGENT)

  for repo in gh.GetTopRepositories():
    print 'Starting repo ', repo.name
    insert_repository(db, repo)
    for commit_sha in gh.GetCommitsList(repo.name, PAGES):
      print '  Getting SHA ' + commit_sha,
      commits = list(gh.GetCommits(repo.name, commit_sha))
      print '-> %d commits' % len(commits)
      insert_commit(db, commits)
      yield


def main():
  crawler = crawl()
  while True:
    crawler.next()


if __name__ == '__main__':
  main()

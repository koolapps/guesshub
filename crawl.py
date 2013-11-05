import config
import github
import model
import MySQLdb as mysql

# How many pages of commits to look at (100 per page).
PAGES = 1


def insert_repository(db, repo):
  sql = 'REPLACE INTO repository VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)'
  row = (repo.id,
         repo.name,
         repo.author,
         repo.author_avatar_url,
         repo.description,
         repo.is_private,
         repo.is_fork,
         repo.watcher_count,
         repo.star_count)
  db.execute(sql, row)


def insert_commit(db, commits):
  sql = 'REPLACE INTO commit VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)'
  rows = []
  for commit in commits:
    rows.append((commit.sha,
                 commit.message,
                 commit.author,
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
                 '\n'.join(commit.diff_lines)))
  db.executemany(sql, rows)


def main():
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
    print 'INSERTING', repo.name
    insert_repository(db, repo)
    for commit_sha in gh.GetCommitsList(repo.name, PAGES):
      commits = list(gh.GetCommits(repo.name, commit_sha))
      print '  INSERTING %d commits' % len(commits)
      insert_commit(db, commits)

if __name__ == '__main__':
  main()

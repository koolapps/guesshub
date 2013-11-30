import config
import MySQLdb as mysql

MAX_ROWS = 20000

def main():
  db = mysql.connect(
      host=config.DB_HOST,
      user=config.DB_USER,
      passwd=config.DB_PASSWORD,
      db=config.DB_NAME)
  cursor = db.cursor()
  cursor.execute('SELECT repository, COUNT(*) as count '
                 'FROM commit '
                 'WHERE grade >= 0 '
                 'GROUP BY repository '
                 'HAVING count >= %s '
                 'ORDER BY count DESC',
                 (MAX_ROWS,))

  for repo, count in cursor.fetchall():
    cursor.execute('UPDATE commit '
                   'SET grade=-grade '
                   'WHERE grade >= 0 AND repository = %s '
                   'LIMIT %s',
                   (repo, count - MAX_ROWS))


if __name__ == '__main__':
  main()

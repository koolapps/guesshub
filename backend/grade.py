import config
import re
import MySQLdb as mysql
import MySQLdb.cursors as mysql_cursors


COUNT_SQL = 'SELECT MAX(order_id) FROM commit'
BATCH_SQL = 'SELECT * FROM commit WHERE %s <= order_id AND order_id < %s'
UPDATE_SQL = 'UPDATE commit SET grade = %s WHERE order_id = %s'
BATCH_SIZE = 1000
WORD_REGEX = re.compile(r'\w+')

MIN_LINE_COUNT = 3
MAX_LINE_COUNT = 30
MAX_LINE_LENGTH = 80
MIN_SPACE_RATIO = 0.01
MIN_WORDS_COUNT = 10
MIN_CONTEXT_LINE_COUNT = 2

IDEAL_LINE_COUNT = 13
IDEAL_DIFF_COUNT = 5
IDEAL_CONTEXT_COUNT = 5

IDEAL_KEYWORD_RATIO = 0.02


def compute_grade(commit):
  """Computes a grade for a given commit.

  Negative values mean invalid commits. Otherwise the lower the grade,
  the closer the commit is to our ideal.
  """
  # TODO: Make grade correlate with difficulty instead.

  lines = commit['diff_lines'].split('\n')

  # Skip diffs with too few lines.
  if len(lines) < MIN_LINE_COUNT:
    return -1

  # Skip diffs with too many lines.
  if len(lines) > MAX_LINE_COUNT:
    return -1

  # Skip diffs with long lines.
  if any([len(l) > MAX_LINE_LENGTH for l in lines]):
    return -1

  # Skip diffs with too little spacing.
  space_count = commit['diff_lines'].replace('\t', ' ').count(' ')
  if space_count / float(len(commit['diff_lines'])) < MIN_SPACE_RATIO:
    return -1

  # How close are we to the ideal total line count?
  line_count_grade = abs(len(lines) - IDEAL_LINE_COUNT)

  # How close are we to the ideal diffed line count?
  diff_count = len([i for i in lines if i[:1] in ('+', '-')])
  diff_count_grade = abs(diff_count - IDEAL_DIFF_COUNT)

  # How close are we to the ideal context line count?
  context_count = len([i for i in lines if i[:1] not in ('+', '-', '\\')])
  if context_count < MIN_CONTEXT_LINE_COUNT:
    return -1
  context_count_grade = abs(context_count - IDEAL_CONTEXT_COUNT)

  # How many keywords do we have.
  keywords_string = ' '.join([commit['repository'],
                              commit['filename'],
                              commit['author_login'] or '',
                              commit['author_name'] or '',
                              commit['block_name'] or ''])
  keywords = set(WORD_REGEX.findall(keywords_string))
  words = WORD_REGEX.findall(commit['diff_lines'])
  if len(words) < MIN_WORDS_COUNT:
    return -1
  keywords_count = len([i for i in words if i in keywords])
  keyword_ratio = float(keywords_count) / len(words)
  keyword_grade = int(keyword_ratio * 20)

  # TODO: Find a better model controlled by these factors.
  return (line_count_grade + diff_count_grade +
          context_count_grade + keyword_grade)


def update_grades():
  """Updates all commits with newly-computed grades."""
  db = mysql.connect(
      host=config.DB_HOST,
      user=config.DB_USER,
      passwd=config.DB_PASSWORD,
      db=config.DB_NAME,
      cursorclass=mysql_cursors.DictCursor)
  
  count_cursor = db.cursor()
  count_cursor.execute(COUNT_SQL)
  count = count_cursor.fetchone()['MAX(order_id)']

  read_cursor = db.cursor()
  write_cursor = db.cursor()
  for start in range(0, count + BATCH_SIZE, BATCH_SIZE):
    print 'Starting at', start
    read_cursor.execute(BATCH_SQL, (start, start + BATCH_SIZE))
    commits = read_cursor.fetchall()
    ids = [c['order_id'] for c in commits]
    grades = map(compute_grade, commits)
    write_cursor.executemany(UPDATE_SQL, zip(grades, ids))
    pos_grades = [i for i in grades if i >= 0]
    print '  invalid=%d, min=%s, max=%s, mean=%s, median=%s' % (
        len(grades) - len(pos_grades),
        min(pos_grades) if pos_grades else None,
        max(pos_grades) if pos_grades else None,
        sum(pos_grades) / float(len(pos_grades)) if pos_grades else None,
        sorted(pos_grades)[len(pos_grades) / 2] if pos_grades else None)


def show_grade_histogram():
  """Prints a histogram of positive grades."""
  db = mysql.connect(
      host=config.DB_HOST,
      user=config.DB_USER,
      passwd=config.DB_PASSWORD,
      db=config.DB_NAME)
  read_cursor = db.cursor()
  read_cursor.execute('SELECT grade, COUNT(grade) FROM commit '
                      'WHERE grade >= 0 GROUP BY grade')
  histogram = dict(read_cursor.fetchall())
  print 'Histogram:'
  for n in range(0, max(histogram.keys()) + 1):
    print '%-2d: %d' % (n, histogram.get(n, 0))
  print 'Total:', sum(histogram.values())


if __name__ == '__main__':
  update_grades()
  show_grade_histogram()

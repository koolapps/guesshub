import config
import collections
import math
import json
import re
import sys
import MySQLdb as mysql
import MySQLdb.cursors as mysql_cursors
from os import path

COUNT_SQL = 'SELECT MAX(order_id) FROM commit'
BATCH_SQL = 'SELECT * FROM commit WHERE %s <= order_id AND order_id < %s'
UPDATE_SQL = 'UPDATE commit SET grade = %s WHERE order_id = %s'
BATCH_SIZE = 1000
WORD_REGEX = re.compile(r'\w+')
SNAKE_REGEX = re.compile(r'[a-zA-Z]{3,}')
CAMEL_REGEX = re.compile(r'(?:[A-Z]|\b)[a-zA-Z]{2,}')
TOKEN_REGEX = re.compile(r'[\x21-\x2f\x3a-\x40\x5B-\x60]+|'
                         r'(?:[A-Z]|\b)[a-zA-Z]{2,}|'
                         r'[a-z]{3,}')

MIN_LINE_COUNT = 3
MAX_LINE_COUNT = 25
MIN_DIFF_COUNT = 2
MAX_LINE_LENGTH = 80
MIN_SPACE_RATIO = 0.01
MIN_WORDS_COUNT = 10
MIN_CONTEXT_LINE_COUNT = 1
MAX_KEYWORDS_COUNT = 12

SMALL_LINE_COUNT = 5
LARGE_LINE_COUNT = 20

ALLOWED_TYPES = {
  'c', 'h',
  'cc', 'cpp', 'cxx', 'hh', 'hpp', 'hxx',
  'coffee', 'coffeescript', 'litcoffee',
  'cs'
  'd',
  'go',
  'hs', 'lhs',
  'java',
  'scala',
  'js', 'ts',
  'lua',
  'php', 'phtml',
  'py', 'pyw',
  'r',
  'rb',
  'scm',
  'sh', 'bash', 'zsh',
  'sql',
  'groovy', 'gvy', 'gy',
  'gsh', 'vsh', 'fsh', 'shader',
}
STOP_WORDS = {
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
  "any", "are", "aren\'t", "as", "at", "be", "because", "been", "before",
  "being", "below", "between", "both", "but", "by", "can\'t", "cannot",
  "could", "couldn\'t", "did", "didn\'t", "do", "does", "doesn\'t", "doing",
  "don\'t", "down", "during", "each", "few", "for", "from", "further", "had",
  "hadn\'t", "has", "hasn\'t", "have", "haven\'t", "having", "he", "he\'d",
  "he\'ll", "he\'s", "her", "here", "here\'s", "hers", "herself", "him",
  "himself", "his", "how", "how\'s", "i", "i\'d", "i\'ll", "i\'m", "i\'ve",
  "if", "in", "into", "is", "isn\'t", "it", "it\'s", "its", "itself", "let\'s",
  "me", "more", "most", "mustn\'t", "my", "myself", "no", "nor", "not", "of",
  "off", "on", "once", "only", "or", "other", "ought", "our", "ours ",
  "ourselves", "out", "over", "own", "same", "shan\'t", "she", "she\'d",
  "she\'ll", "she\'s", "should", "shouldn\'t", "so", "some", "such", "than",
  "that", "that\'s", "the", "their", "theirs", "them", "themselves", "then",
  "there", "there\'s", "these", "they", "they\'d", "they\'ll", "they\'re",
  "they\'ve", "this", "those", "through", "to", "too", "under", "until", "up",
  "very", "was", "wasn\'t", "we", "we\'d", "we\'ll", "we\'re", "we\'ve", "were",
  "weren\'t", "what", "what\'s", "when", "when\'s", "where", "where\'s",
  "which", "while", "who", "who\'s", "whom", "why", "why\'s", "with", "won\'t",
  "would", "wouldn\'t", "you", "you\'d", "you\'ll", "you\'re", "you\'ve",
  "your", "yours", "yourself", "yourselves"
}

DB = mysql.connect(
    host=config.DB_HOST,
    user=config.DB_USER,
    passwd=config.DB_PASSWORD,
    db=config.DB_NAME,
    cursorclass=mysql_cursors.DictCursor)


class Model(object):
  """A naive Bayesian text classifier."""
  
  def __init__(self):
    self.samples = collections.defaultdict(
        lambda: collections.defaultdict(lambda: 1))
    self.label_counts = collections.defaultdict(lambda: 0)

  def probability(self, features, label):
    """Returns the probability of a feature set being labeled with a given label.

    The features a list of strings. The returned value is between 0 and 1.
    """
    log_prob = self._scaled_log_probability(features, label)
    total_log_prob = self._scaled_log_probability(features, label)
    for other_label in self.label_counts:
      if other_label != label:
        other_log_prob = self._scaled_log_probability(features, other_label)
        total_log_prob = self._log_add(total_log_prob, other_log_prob)
    return math.exp(log_prob - total_log_prob)

  def classify(self, features):
    """Returns the most likely label for a given feature set (string list)."""
    max_prob = -1
    max_val = None
    for label in self.label_counts:
      prob = self._scaled_log_probability(features, label)
      if prob > max_prob:
        max_prob = prob
        max_val = label
    return max_val

  def dump(self, filename):
    """Saves the model to a file in JSON format."""
    f = open(filename, 'w')
    json.dump([m.samples, m.label_counts], f)
    f.close()

  @staticmethod
  def load(filename):
    """Loads a model previously saved by Model.dump()."""
    data = json.load(open(filename))
    m = Model()
    m.samples = data[0]
    m.label_counts = data[1]
    return m

  @staticmethod
  def build():
    """Generates a classifier based on all the commits in the DB."""
    m = Model()
    for batch in fetch_commits():
      for commit in batch:
        tokens = tokenize(
            commit['diff_lines'] + ' ' + (commit['block_name'] or ''))
        tokens = [i.lower() for i in tokens]
        counts = collections.defaultdict(int)
        for token in tokens:
          if token not in STOP_WORDS:
            counts[token] += 1
        top_tokens = sorted(counts.iteritems(), key=lambda x:-x[1])[:20]
        features = [i[0] for i in top_tokens]
        features.append(path.splitext(commit['filename'])[1])
        m._add_sample(features, commit['repository'])

    return m

  def _add_sample(self, features, label):
    """Adds a feature set (string list) and its label to the samples."""
    for feature in features:
      self.samples[feature][label] += 1
    self.label_counts[label] += 1

  def _scaled_log_probability(self, features, label):
    """Returns the likelihood of features to be labeled with the given label.

    The returned value is scaled by the probability of the features, so
    it is only meaningful when compared to values returned from calls to
    this method that pass the same features (but a different label).

    The value is in log space because it may exceed the range of a double
    precision floating point number.
    """
    label_count = self.label_counts.get(label, 0)
    total_labels = sum(self.label_counts.values())
    class_probability = (label_count / float(total_labels))
    log_correlation_probability = 0
    for feature in features:
      feature_counts = self.samples.get(feature, {})
      c = feature_counts.get(label, 1) / float(label_count)
      log_correlation_probability += math.log(c)
    return math.log(class_probability) + log_correlation_probability

  @staticmethod
  def _log_add(log_x, log_y):
    """Returns log(x + y) given log(x) and log(y)."""
    if log_y > log_x:
      log_x, log_y = log_y, log_x
    if log_x == float('-inf'):
      return log_x
    neg_diff = log_y - log_x
    if neg_diff < -20:
      return log_x
    return log_x + math.log(1.0 + math.exp(neg_diff))


def compute_grade(commit, classifier):
  """Computes a grade for a given commit, either -1 or between 0 and 100.

  -1 signifies invalid commits. Otherwise harder commits have higher grades.
  """

  # Skip non code diffs.
  (_, ext) = path.splitext(commit['filename'])
  if ext[1:] not in ALLOWED_TYPES:
    return -1

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

  # Skip diffs with too few diff lines.
  diff_count = len([i for i in lines if i[:1] in ('+', '-')])
  if diff_count < MIN_DIFF_COUNT:
    return -1

  # Skip diffs with too few context lines.
  context_count = len([i for i in lines if i[:1] not in ('+', '-', '\\')])
  if context_count < MIN_CONTEXT_LINE_COUNT:
    return -1

  # Skip diffs with too few words.
  words = extract_words(commit['diff_lines'], commit['block_name'])
  if len(words) < MIN_WORDS_COUNT:
    return -1

  # How many keywords do we have that reference the repo name?
  repo_keywords = set(extract_words(commit['repository']))
  keywords_count = len([i for i in words if i in repo_keywords])

  # Skip diffs with too many keywords.
  if keywords_count > MAX_KEYWORDS_COUNT:
    return -1

  # How many keywords do we have that reference the metadata?
  metadata = (commit['filename'], commit['author_login'], commit['author_name'])
  metadata_keywords = set(extract_words(*metadata))
  metadata_keyword_matches = [i for i in words if i in metadata_keywords]
  metadata_keywords_count = len(metadata_keyword_matches)

  # Calculate the grade, starting from perfectly hard.
  if keywords_count > 0:
    # Has repo keywords. Difficulty <= 50.
    grade = 50
    grade -= min(keywords_count, 6.25) * 8
  else:
    # No repo keywords. Difficulty > 50.
    grade = 100

    # Maybe we have metadata keywords?
    grade -= min(metadata_keywords_count, 5) * 2

    # Classify.
    tokens = tokenize(commit['diff_lines'] + ' ' + (commit['block_name'] or ''))
    probability = classifier.probability(tokens, commit['repository'])
    if probability < 0.001 and probability != 0:
      # Switch to log scaling here.
      grade -= min(-math.log(probability) / 15, 40)
    else:
      grade -= (1 - probability) * 40

  return int(round(grade))


def tokenize(s):
  """Extracts tokesn from a string."""
  return TOKEN_REGEX.findall(s)


def extract_words(*strings):
  """Extracts words from all strings in a list."""
  text = ' '.join([i or '' for i in strings])
  words = WORD_REGEX.findall(text)

  tokens = []
  for word in words:
    word_lower = word.lower()
    tokens.append(word_lower)
    # Extract snake- and camel-case words.
    snakes = SNAKE_REGEX.findall(word)
    camels = CAMEL_REGEX.findall(word)
    for subword in set(snakes + camels):
      subword_lower = subword.lower()
      if subword_lower != word_lower:
        tokens.append(subword_lower)

  return tokens


def fetch_commits():
  """Yields batches of commits from the DB."""
  count_cursor = DB.cursor()
  count_cursor.execute(COUNT_SQL)
  count = count_cursor.fetchone()['MAX(order_id)']

  read_cursor = DB.cursor()
  for start in range(0, count + BATCH_SIZE, BATCH_SIZE):
    print 'Starting at', start
    read_cursor.execute(BATCH_SQL, (start, start + BATCH_SIZE))
    yield read_cursor.fetchall()


def update_grades(classifier):
  """Updates all commits with newly-computed grades."""
  write_cursor = DB.cursor()
  for batch in fetch_commits():
    ids = [c['order_id'] for c in batch]
    grades = map(lambda c: compute_grade(c, classifier), batch)
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
  read_cursor = DB.cursor()
  read_cursor.execute('SELECT grade, COUNT(grade) FROM commit '
                      'WHERE grade >= 0 GROUP BY grade')
  histogram = dict(read_cursor.fetchall())
  print 'Histogram:'
  for n in range(0, max(histogram.keys()) + 1):
    print '%-2d: %d' % (n, histogram.get(n, 0))
  print 'Total:', sum(histogram.values())


if __name__ == '__main__':
  mode = sys.argv[1]
  if mode == 'build':
    m = Model.build()
    m.dump('model.json')
  elif mode == 'grade':
    m = Model.load('model.json')
    update_grades(m)
    show_grade_histogram()
  else:
    print 'Invalid mode. Call "grade.py build" or "grade.py grade".'

import re

# A regex to pull the repository name from a commit URL.
REPOSITORY_REGEX = re.compile(
    r'^https://api.github.com/repos/([^/]+/[^/]+)/commits/[a-fA-F0-9]+$')

# A regex to pull the repository name from a commit URL.
PATCH_HEADER_REGEX = re.compile(
    r'^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@(?: (\S.*))?$')


class Commit(object):
  """A single patch hunk linked to a GitHub commit."""

  MAX_LINES_PER_PATCH = 25

  def __init__(self, commit_json,
               patch_number, patch_filename,
               patch_start_old, patch_start_new,
               patch_header, patch_lines):
    self.sha = commit_json['sha']
    self.patch_number = patch_number
    self.message = commit_json['commit']['message']
    if commit_json['author'] is not None and 'login' in commit_json['author']:
      self.author_login = commit_json['author']['login']
      self.author_avatar_url = commit_json['author']['avatar_url']
    else:
      self.author_login = None
      self.author_avatar_url = None
    self.author_name = commit_json['commit']['author']['name']

    repository_matches = REPOSITORY_REGEX.findall(commit_json['url'])
    assert repository_matches and len(repository_matches) == 1, commit_json
    self.repository = repository_matches[0]

    self.filename = patch_filename
    self.additions = len([i for i in patch_lines if i.startswith('+')])
    self.deletions = len([i for i in patch_lines if i.startswith('-')])
    self.old_start_line = patch_start_old
    self.new_start_line = patch_start_new
    self.block_name = patch_header or None
    self.diff_lines = [i.replace('\t', '  ') for i in patch_lines]

  @staticmethod
  def split_from_json(json):
    """Given a GitHub commit JSON, yield Commit objects for all patch hunks."""
    assert json
    patch_number = 0
    if 'files' in json:
      for patch_json in json['files']:
        if 'patch' in patch_json:
          for hunk in Commit.split_patch(patch_json['patch']):
            for patch_block in Commit.split_hunk(hunk):
              yield Commit(json,
                           patch_number,
                           patch_json['filename'],
                           *patch_block)
              patch_number += 1

  @staticmethod
  def split_patch(patch):
    """Given a full patch, yield all hunks.

    The hunks are tuples of:
      old_start_line, new_start_line, optional_header, list_of_lines
    """
    current_header = None
    current_lines = []
    def assemble():
      matches = PATCH_HEADER_REGEX.findall(current_header)
      assert matches and len(matches) == 1, current_header
      old_start, new_start, header = matches[0]
      return old_start, new_start, header, current_lines

    for line in patch.splitlines():
      if line.startswith('@@'):
        # Header line.
        if current_header is not None:
          # Flush current block.
          yield assemble()
        current_header = line
      else:
        # Regular line.
        current_lines.append(line)

    assert current_header is not None, patch
    yield assemble()

  @staticmethod
  def split_hunk(input):
    """Given a patch hunk, split it into pieces.

    The yielded results are hunks in the same format as the input.
    """
    old_start_line, new_start_line, optional_header, lines = input
    if len(lines) <= Commit.MAX_LINES_PER_PATCH:
      yield input
    else:
      def is_context_line(i):
        return lines[i].startswith(' ')

      last = 0
      cur_old_start_line = old_start_line
      cur_new_start_line = new_start_line
      seen_a_diff = False
      for i in range(0, len(lines)):
        if lines[i].startswith('-'):
          cur_old_start_line += 1
          seen_a_diff = True
        elif lines[i].startswith('+'):
          cur_new_start_line += 1
          seen_a_diff = True
        elif lines[i].startswith(' '):
          cur_old_start_line += 1
          cur_new_start_line += 1

        if (i != len(lines) - 1 and
            is_context_line(i - 1) and
            is_context_line(i) and
            is_context_line(i + 1) and
            seen_a_diff):
          yield old_start_line, new_start_line, optional_header, lines[last:i]
          seen_a_diff = False
          last = i
          old_start_line = cur_old_start_line
          new_start_line = cur_new_start_line

      if last != i:
        yield old_start_line, new_start_line, optional_header, lines[last:i]


class Repository(object):
  """A GitHub repository."""

  def __init__(self, repository_json, star_count):
    self.id = repository_json['id']
    self.name = repository_json['full_name']
    self.author = repository_json['owner']['login']
    self.author_avatar_url = repository_json['owner']['avatar_url']
    self.description = repository_json['description']
    self.is_private = repository_json['private']
    self.is_fork = repository_json['fork']
    self.watcher_count = repository_json['watchers']
    self.star_count = star_count

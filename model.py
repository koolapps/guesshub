import re

# A regex to pull the repository name from a commit URL.
RE_REPOSITORY = re.compile(
    '$https://api.github.com/repos/\w+/\w+/commits/[a-fA-F0-9]+$')


class Commit(object):
  """TODO"""

  def __init__(self, commit_json, patch_json):
    self.sha = commit_json['sha']
    self.message = commit_json['commit']['message']
    self.author = commit_json['author']['login']
    self.author_avatar_url = commit_json['author']['avatar_url']

    repository_matches = RE_REPOSITORY.findall(commit_json['url'])
    assert len(repository_matches) == 1, commit_json
    self.repository = repository_matches[1]

    self.contents_url = patch_json['raw_url']
    self.filename = patch_json['filename']
    self.additions = patch_json['additions']
    self.deletions = patch_json['deletions']
    self.diff = patch_json['patch']

  @staticmethod
  def from_json(self, json):
    """TODO"""
    return [Commit(json, patch_json) for patch_json in json['files']]


class Reository(object):
  """TODO"""

  def __init__(self, repository_json):
    self.id = repository_json['id']
    self.name = repository_json['full_name']
    self.author = repository_json['owner']['login']
    self.author_avatar_url = repository_json['owner']['avatar_url']
    self.description = repository_json['description']
    self.is_private = repository_json['private']
    self.is_fork = repository_json['fork']

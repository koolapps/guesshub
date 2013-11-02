SCHEMA = ''  # TODO

class Commit(object):
  """TODO"""

  def __init__(self, commit_json, patch_json):
    self.sha = commit_json['sha']
    self.message = commit_json['commit']['message']
    self.author = commit_json['author']['login']
    self.author_avatar_url = commit_json['author']['avatar_url']

    self.contents_url = patch_json['raw_url']
    self.filename = patch_json['filename']
    self.additions = patch_json['additions']
    self.deletions = patch_json['deletions']
    self.diff = patch_json['patch']

  @staticmethod
  def from_json(self, json):
    """TODO"""
    return [Commit(json, patch_json) for patch_json in json['files']]

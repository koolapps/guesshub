#!/bin/python2

import itertools
import re
import requests
import time

import model

# GitHub auth.
CLIENT_ID = '6e91d029d2eeca74bf24'
CLIENT_SECRET = '70129cd2a9d2b993a19b17a4c38696b96c50d725'
CLIENT_USER_AGENT = 'max99x/game-off-2013'

# DB auth.
DB_USER = ''
DB_PASSWORD = ''

# Crawling settings.
PAGE_SIZE = 100  # Maximum: 100.
COMMIT_PAGES = 2

# Implementation constants.
NEXT_PAGE_REGEX = re.compile(r'<([^<>]+)>; rel="next"')


class GitHub(object):
  def Fetch(self, url, **params):
    """
    Performs an authenticated GitHub request, retrying on server errors and
    sleeping if the rate limit is exceeded.

    Args:
      url: The URL to request. An absolute path or full URL. Can include a
          query string.
      prams: The query parameters to send.

    Returns:
      A requests.Response object.
    """
    full_params = params.copy()
    full_params['client_id'] = CLIENT_ID
    full_params['client_secret'] = CLIENT_SECRET
    request_headers = {'User-Agent': CLIENT_USER_AGENT}
    if not url.startswith('https://api.github.com/'):
      url = 'https://api.github.com/' + url
    result = requests.get(url, params=full_params, headers=request_headers)

    # Explode on client errors and retry on server error.
    status = result.status_code 
    if status >= 500:
      return self.Fetch(url, **params)
    elif status >= 400 and status < 500:
      raise RuntimeError('Client error, HTTP %s.\n' +
                         'Path: %s\nParams: %s\nResponse: %s' %
                         (status, url, params, result.json()))

    # Sleep and retry on rate limit.
    response_headers = result.headers
    requests_allowed = int(response_headers['X-RateLimit-Remaining'])
    assert requests_allowed >= 0, response_headers
    if requests_allowed == 0:
      reset_time = int(response_headers['X-RateLimit-Reset'])
      delay_time = int(time.time() - reset_time) + 1
      if delay_time > 0:  # Time sync issues may result in negative delay.
        time.sleep(delay_time)
        return self.Fetch(url, **params)

    # All's well that ends well.
    return result

  def List(self, url, pages=None, **params):
    """TODO"""
    if pages is None:
      page_range = itertools.repeat(1)
    else:
      page_range = range(pages)
    for page in page_range:
      # Fetch current page.
      response = self.Fetch(url, per_page=PAGE_SIZE, **params)
      for commit_json in response.json():
        yield commit_json

      # Get next page.
      next_page_links = NEXT_PAGE_REGEX.findall(response.headers['Link'])
      assert len(next_page_links) == 1, response.headers
      url = next_page_links[0]

  def GetCommitsList(self, repo):
    """TODO"""
    for commit_json in self.List('repos/%s/commits' % repo, COMMIT_PAGES):
      yield commit_json['sha']

  def GetCommits(self, repo, sha):
    """TODO"""
    commit_json = self.Fetch('repos/%s/commits/%s' % (repo, sha)).json()
    for commit in model.Commit.split_from_json(commit_json):
      yield commit

  def GetRespositories(self, since=None):
    """TODO"""
    for repository_json in self.List('repositories'):
      yield model.Repository(repository_json)

import os, sys

# Override import path.
ROOT = os.path.dirname(os.path.realpath(__file__))
sys.path.insert(0, ROOT)

from server import APP as application

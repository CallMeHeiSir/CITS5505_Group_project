import unittest
import os
import sys

# Ensure backend directory is in sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# List of test files to run (excluding test_utils.py)
test_files = [
    'test_visualization.py',
    'test_upload.py',
    'test_share.py',
    'test_checkin.py',
    'test_change_password.py',
    'test_retrieve_password.py',
    'test_register.py',
    'test_login.py',
]

def main():
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    for test_file in test_files:
        # Remove .py extension for import
        module_name = test_file[:-3]
        # Import as relative to this directory
        module = __import__(module_name)
        suite.addTests(loader.loadTestsFromModule(module))
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    if result.wasSuccessful():
        exit(0)
    else:
        exit(1)

if __name__ == '__main__':
    main() 
"""
This file provides utility functions for other test files.
It is NOT a test case file and should not be run directly with unittest.
"""
import re
import os

TEST_PASSWORD = os.environ['TEST_USER_PASSWORD']

def extract_csrf_token(html):
    """Extract CSRF token from HTML page source."""
    match = re.search(r'name="csrf_token"[^>]*value="([^"]+)"', html)
    return match.group(1) if match else ''

def login_test_user(client, username, email, password=TEST_PASSWORD):
    """Log in a test user using the login page and CSRF token."""
    # Get CSRF token from login page
    login_page = client.get('/auth/login')
    csrf_token = extract_csrf_token(login_page.data.decode())
    # Perform login
    return client.post('/auth/login', data={
        'username': username,
        'email': email,
        'password': password,
        'verificationCode': 'bypass',
        'csrf_token': csrf_token
    }, follow_redirects=True) 
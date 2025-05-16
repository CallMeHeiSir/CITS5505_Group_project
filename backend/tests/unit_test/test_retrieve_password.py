import unittest
from app import create_app, db
from models.user import User
from werkzeug.security import generate_password_hash
import os
TEST_PASSWORD = os.environ['TEST_USER_PASSWORD']
NEW_PASSWORD = os.environ['NEW_USER_PASSWORD']

class RetrievePasswordTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app('testing')
        self.client = self.app.test_client()
        with self.app.app_context():
            db.create_all()
            # Insert test user
            user = User(username='testuser',email='test1@example.com',password_hash=generate_password_hash(TEST_PASSWORD))
            db.session.add(user)
            db.session.commit()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def test_retrieve_password_page_loads(self):
        response = self.client.get('/auth/retrieve_password')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Retrieve Password', response.data)

    def test_retrieve_password_valid(self):
        response = self.client.post('/auth/retrieve_password', data={
            'username': 'testuser',
            'email': 'test1@example.com',
            'new_password': NEW_PASSWORD,
            'confirm_new_password': NEW_PASSWORD,
        }, follow_redirects=True)
        self.assertIn(b'Password retrieved successfully', response.data)

    def test_retrieve_password_invalid_email(self):
        response = self.client.post('/auth/retrieve_password', data={
            'username': 'testuser',
            'email': 'wrong@example.com',
            'new_password': NEW_PASSWORD,
            'confirm_new_password': NEW_PASSWORD,
        }, follow_redirects=True)
        self.assertIn(b'Invalid username or email', response.data)

    def test_retrieve_password_mismatch(self):
        response = self.client.post('/auth/retrieve_password', data={
            'username': 'testuser',
            'email': 'test1@example.com',
            'new_password': NEW_PASSWORD,
            'confirm_new_password': 'Other@1234',
        }, follow_redirects=True)
        self.assertIn(b'New passwords do not match', response.data)

if __name__ == '__main__':
    unittest.main()

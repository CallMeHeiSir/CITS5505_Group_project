import unittest
from app import create_app, db
from models.user import User
from werkzeug.security import generate_password_hash
from flask_login import login_user
import os

TEST_PASSWORD = os.environ['TEST_USER_PASSWORD']
NEW_PASSWORD = os.environ['NEW_USER_PASSWORD']

class ChangePasswordTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app('testing')
        self.client = self.app.test_client()
        with self.app.app_context():
            db.create_all()
            # 插入测试用户
            user = User(username='testuser',email='test1@example.com',password_hash=generate_password_hash(TEST_PASSWORD))
            db.session.add(user)
            db.session.commit()
            self.user_id = user.id

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def login(self):
        # 直接登录用户，设置session
        with self.client.session_transaction() as sess:
            sess['_user_id'] = str(self.user_id)

    def test_change_password_page_loads(self):
        self.login()
        response = self.client.get('/auth/change_password')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Change Password', response.data)

    def test_change_password_valid(self):
        self.login()
        response = self.client.post('/auth/change_password', data={
            'current_password': TEST_PASSWORD,
            'new_password': NEW_PASSWORD,
            'confirm_new_password': NEW_PASSWORD,
        }, follow_redirects=True)
        self.assertIn(b'Password changed successfully', response.data)

    def test_change_password_wrong_current(self):
        self.login()
        response = self.client.post('/auth/change_password', data={
            'current_password': 'wrongpassword',
            'new_password': NEW_PASSWORD,
            'confirm_new_password': NEW_PASSWORD,
        }, follow_redirects=True)
        self.assertIn(b'Current password is incorrect', response.data)

    def test_change_password_mismatch(self):
        self.login()
        response = self.client.post('/auth/change_password', data={
            'current_password': TEST_PASSWORD,
            'new_password': NEW_PASSWORD,
            'confirm_new_password': 'Other@1234',
        }, follow_redirects=True)
        self.assertIn(b'New passwords do not match', response.data)

    def test_change_password_empty(self):
        self.login()
        response = self.client.post('/auth/change_password', data={
            'current_password': '',
            'new_password': '',
            'confirm_new_password': '',
        }, follow_redirects=True)
        self.assertIn(b'All fields are required', response.data)

if __name__ == '__main__':
    unittest.main()

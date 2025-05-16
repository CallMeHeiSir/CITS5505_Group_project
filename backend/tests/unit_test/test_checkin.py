import unittest
import os
from app import create_app, db
from models.user import User
from tests.unit_test.test_utils import extract_csrf_token, login_test_user

TEST_PASSWORD = os.environ['TEST_USER_PASSWORD']

class CheckinTestCase(unittest.TestCase):
    def setUp(self):
        """
        Set up a test Flask app and database, and create a test user for check-in tests.
        """
        self.app = create_app('testing')
        self.client = self.app.test_client()
        with self.app.app_context():
            db.create_all()
            user = User(username='user1', email='user1@test.com')
            user.set_password(TEST_PASSWORD)
            db.session.add(user)
            db.session.commit()
            self.user = user

    def tearDown(self):
        """
        Clean up the database after each test.
        """
        with self.app.app_context():
            db.drop_all()

    def test_daily_checkin(self):
        """
        Test daily check-in functionality with a valid mood and CSRF token.
        """
        with self.client as c:
            login_test_user(c, 'user1', 'user1@test.com', TEST_PASSWORD)
            res = c.get('/index')  # The index page is assumed to contain a CSRF token
            csrf_token = extract_csrf_token(res.data.decode())
            response = c.post('/api/checkin', data={
                'mood': 'good',
                'csrf_token': csrf_token
            })
            print(f"[daily_checkin] status_code: expected 200, got {response.status_code}")
            self.assertEqual(response.status_code, 200)
            self.assertIn('success', response.get_data(as_text=True))
            print("[daily_checkin] PASSED")

if __name__ == '__main__':
    unittest.main() 
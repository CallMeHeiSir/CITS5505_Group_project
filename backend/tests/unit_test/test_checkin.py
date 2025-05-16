import unittest
from app import create_app, db
from models.user import User
from tests.unit_test.test_utils import extract_csrf_token, login_test_user

class CheckinTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app('testing')
        self.client = self.app.test_client()
        with self.app.app_context():
            db.create_all()
            user = User(username='user1', email='user1@test.com')
            user.set_password('test123')
            db.session.add(user)
            db.session.commit()
            self.user = user

    def tearDown(self):
        with self.app.app_context():
            db.drop_all()

    def test_daily_checkin(self):
        with self.client as c:
            login_test_user(c, 'user1', 'user1@test.com', 'test123')
            res = c.get('/index')  # 假设index页面有csrf_token
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
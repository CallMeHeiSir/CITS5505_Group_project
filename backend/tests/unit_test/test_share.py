import unittest
import datetime
import os
from app import create_app, db
from models.user import User
from models.activity_log import ActivityLog
from models.friend import Friendship
from tests.unit_test.test_utils import extract_csrf_token, login_test_user

TEST_PASSWORD = os.environ['TEST_USER_PASSWORD']

class ShareTestCase(unittest.TestCase):
    def setUp(self):
        """
        Set up a test Flask app and database, and create two users and a friendship for sharing tests.
        """
        self.app = create_app('testing')
        self.client = self.app.test_client()
        with self.app.app_context():
            db.create_all()
            # Create two users
            user1 = User(username='user1', email='user1@test.com')
            user1.set_password(TEST_PASSWORD)
            user2 = User(username='user2', email='user2@test.com')
            user2.set_password(TEST_PASSWORD)
            db.session.add_all([user1, user2])
            db.session.commit()
            # Insert a friendship directly
            friend = Friendship(user1_id=user1.id, user2_id=user2.id)
            db.session.add(friend)
            db.session.commit()
            # Create an activity for sharing
            activity = ActivityLog(user_id=user1.id, activity_type='running', date=datetime.date(2024, 6, 1), duration=30)
            db.session.add(activity)
            db.session.commit()
            self.user1_id = user1.id
            self.user2_id = user2.id
            self.activity_id = activity.id

    def tearDown(self):
        """
        Clean up the database after each test.
        """
        with self.app.app_context():
            db.drop_all()

    def test_share_activity(self):
        """
        Test sharing an activity from the share page.
        """
        with self.client as c:
            login_test_user(c, 'user1', 'user1@test.com', TEST_PASSWORD)
            res = c.get('/share')
            csrf_token = extract_csrf_token(res.data.decode())
            response = c.post('/api/share/activity', data={
                'share_to_user_id': self.user2_id,
                'activity_id': self.activity_id,
                'share_type': 'activity',
                'csrf_token': csrf_token
            }, follow_redirects=True)
            self.assertEqual(response.status_code, 200)
            self.assertIn('success', response.get_data(as_text=True))

    def test_share_from_recent_activity(self):
        """
        Test sharing an activity from the upload page's recent activity section.
        """
        with self.client as c:
            login_test_user(c, 'user1', 'user1@test.com', TEST_PASSWORD)
            res = c.get('/share')
            csrf_token = extract_csrf_token(res.data.decode())
            response = c.post('/api/share/activity', data={
                'share_to_user_id': self.user2_id,
                'activity_id': self.activity_id,
                'share_type': 'activity',
                'csrf_token': csrf_token
            }, follow_redirects=True)
            print(f"[share_from_recent_activity] status_code: expected 200, got {response.status_code}")
            self.assertEqual(response.status_code, 200)
            self.assertIn('success', response.get_data(as_text=True))
            print("[share_from_recent_activity] PASSED")

    def test_share_from_visualization_table(self):
        """
        Test sharing an activity from the visualization page's table.
        """
        with self.client as c:
            login_test_user(c, 'user1', 'user1@test.com', TEST_PASSWORD)
            res = c.get('/visualize')
            csrf_token = extract_csrf_token(res.data.decode())
            response = c.post('/api/share/activity', data={
                'share_to_user_id': self.user2_id,
                'activity_id': self.activity_id,
                'share_type': 'visualization',
                'visualization_type': 'progress',
                'csrf_token': csrf_token
            }, follow_redirects=True)
            print(f"[share_from_visualization_table] status_code: expected 200, got {response.status_code}")
            self.assertEqual(response.status_code, 200)
            self.assertIn('success', response.get_data(as_text=True))
            print("[share_from_visualization_table] PASSED")

if __name__ == '__main__':
    unittest.main() 
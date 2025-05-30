import unittest
import datetime
import os
from app import create_app, db
from models.user import User
from models.activity_log import ActivityLog
from tests.unit_test.test_utils import extract_csrf_token, login_test_user

TEST_PASSWORD = os.environ['TEST_USER_PASSWORD']

class VisualizationTestCase(unittest.TestCase):
    def setUp(self):
        """
        Set up a test Flask app and database, and create a test user and activity for visualization tests.
        """
        self.app = create_app('testing')
        self.client = self.app.test_client()
        with self.app.app_context():
            db.create_all()
            user = User(username='user1', email='user1@test.com')
            user.set_password(TEST_PASSWORD)
            db.session.add(user)
            db.session.commit()
            # Create an activity for visualization
            activity = ActivityLog(user_id=user.id, activity_type='running', date=datetime.date(2024, 6, 1), duration=30)
            db.session.add(activity)
            db.session.commit()
            self.user_id = user.id

    def tearDown(self):
        """
        Clean up the database after each test.
        """
        with self.app.app_context():
            db.drop_all()

    def _get_visualization_response(self):
        """
        Helper function to log in and request visualization data.
        """
        with self.client as c:
            login_test_user(c, 'user1', 'user1@test.com', TEST_PASSWORD)
            res = c.get('/visualize')
            csrf_token = extract_csrf_token(res.data.decode())
            response = c.post('/api/visualization/activities', data={
                'startDate': '2024-06-01',
                'endDate': '2024-06-30',
                'activityType': 'running',
                'csrf_token': csrf_token
            })
            return response

    def test_weekly_data(self):
        """Test that weekly_data is present and contains expected keys."""
        response = self._get_visualization_response()
        print(f"[weekly_data] status_code: expected 200, got {response.status_code}")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('weekly_data', data)
        self.assertIn('labels', data['weekly_data'])
        self.assertIn('duration', data['weekly_data'])
        self.assertIn('distance', data['weekly_data'])
        self.assertIn('calories', data['weekly_data'])
        print(f"[weekly_data] keys: expected labels/duration/distance/calories, got {list(data['weekly_data'].keys())} -- PASSED")

    def test_progress_data(self):
        """Test that progress_data is present and contains expected keys."""
        response = self._get_visualization_response()
        data = response.get_json()
        self.assertIn('progress_data', data)
        self.assertIn('labels', data['progress_data'])
        self.assertIn('duration', data['progress_data'])
        self.assertIn('distance', data['progress_data'])
        print(f"[progress_data] keys: expected labels/duration/distance, got {list(data['progress_data'].keys())} -- PASSED")

    def test_activity_distribution(self):
        """Test that activity_distribution is present and contains expected keys."""
        response = self._get_visualization_response()
        data = response.get_json()
        self.assertIn('activity_distribution', data)
        self.assertIn('labels', data['activity_distribution'])
        self.assertIn('data', data['activity_distribution'])
        print(f"[activity_distribution] keys: expected labels/data, got {list(data['activity_distribution'].keys())} -- PASSED")

    def test_calories_trend(self):
        """Test that calories_trend is present and contains expected keys."""
        response = self._get_visualization_response()
        data = response.get_json()
        self.assertIn('calories_trend', data)
        self.assertIn('labels', data['calories_trend'])
        self.assertIn('data', data['calories_trend'])
        print(f"[calories_trend] keys: expected labels/data, got {list(data['calories_trend'].keys())} -- PASSED")

    def test_stats(self):
        """Test that stats is present and contains expected keys."""
        response = self._get_visualization_response()
        data = response.get_json()
        self.assertIn('stats', data)
        self.assertIn('total_duration', data['stats'])
        self.assertIn('total_distance', data['stats'])
        self.assertIn('total_calories', data['stats'])
        print(f"[stats] keys: expected total_duration/total_distance/total_calories, got {list(data['stats'].keys())} -- PASSED")

    def test_activities(self):
        """Test that activities is present and is a list."""
        response = self._get_visualization_response()
        data = response.get_json()
        self.assertIn('activities', data)
        self.assertIsInstance(data['activities'], list)
        print(f"[activities] type: expected list, got {type(data['activities']).__name__} -- PASSED")

    def test_json_response(self):
        """Test that the response content type is application/json."""
        response = self._get_visualization_response()
        print(f"[json_response] content_type: expected 'application/json', got {response.content_type}")
        self.assertEqual(response.content_type, 'application/json')
        print("[json_response] PASSED")

    def test_invalid_request(self):
        """Test that missing CSRF token returns an error status code."""
        response = self.client.post('/api/visualization/activities', data={
            'startDate': '2024-06-01',
            'endDate': '2024-06-30',
            'activityType': 'running'
        })
        print(f"[invalid_request] status_code: expected 400/403/302, got {response.status_code}")
        self.assertIn(response.status_code, (400, 403, 302))
        print("[invalid_request] PASSED")

if __name__ == '__main__':
    unittest.main() 
import unittest
from io import BytesIO
from unittest.mock import patch

from app import create_app, db
from models.user import User
from tests.unit_test.test_utils import extract_csrf_token, login_test_user

class TestUpload(unittest.TestCase):
    def setUp(self):
        self.app = create_app('testing')
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()
        
        # Create test user
        self.user = User(username='testuser', email='test@example.com')
        self.user.set_password('password123')
        db.session.add(self.user)
        db.session.commit()
        
        self.client = self.app.test_client()
        self.login_response = login_test_user(self.client, 'testuser', 'test@example.com', 'password123')
        self.csrf_token = extract_csrf_token(self.login_response.get_data(as_text=True))

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def test_upload_page(self):
        """Test upload page access"""
        response = self.client.get('/upload')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Upload File', response.data)

    def test_upload_file_success(self):
        """Test successful CSV file upload"""
        csv_content = (
            'activity_type,date,duration,height,weight,age,location\n'
            'running,2024-01-01,30,170,65,25,Perth\n'
            'walking,2024-01-02,45,170,65,25,Perth'
        ).encode('utf-8')
        data = {
            'file': (BytesIO(csv_content), 'activities.csv'),
            'csrf_token': self.csrf_token
        }
        response = self.client.post(
            '/analytics/api/activities/upload',
            data=data,
            content_type='multipart/form-data'
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn(b'success', response.data.lower())

    def test_upload_file_no_file(self):
        """Test upload without file"""
        data = {
            'csrf_token': self.csrf_token
        }
        response = self.client.post(
            '/analytics/api/activities/upload',
            data=data,
            content_type='multipart/form-data'
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn(b'No file uploaded', response.data)

    def test_upload_file_invalid_type(self):
        """Test upload with invalid file type"""
        data = {
            'file': (BytesIO(b'test file content'), 'test.exe'),
            'csrf_token': self.csrf_token
        }
        response = self.client.post(
            '/analytics/api/activities/upload',
            data=data,
            content_type='multipart/form-data'
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn(b'Only CSV files are allowed', response.data)

    def test_upload_file_too_large(self):
        """Test upload with file too large"""
        large_content = b'x' * (6 * 1024 * 1024)  # 6MB
        data = {
            'file': (BytesIO(large_content), 'activities.csv'),
            'csrf_token': self.csrf_token
        }
        response = self.client.post(
            '/analytics/api/activities/upload',
            data=data,
            content_type='multipart/form-data'
        )
        self.assertEqual(response.status_code, 413)
        self.assertIn(b'Uploaded CSV file is too large', response.data)

if __name__ == '__main__':
    unittest.main() 
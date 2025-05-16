import unittest
from app import create_app, db
from models.user import User
from models.verification_code import VerificationCode
from werkzeug.security import generate_password_hash
from datetime import datetime
from io import BytesIO
import os
TEST_PASSWORD = os.environ['TEST_USER_PASSWORD']
NEW_PASSWORD = os.environ['NEW_USER_PASSWORD']

class RegisterTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app('testing')
        self.client = self.app.test_client()
        with self.app.app_context():
            db.create_all()
            # Insert verification code
            code = VerificationCode(
                email='test2@example.com',
                code='654321',
                created_at=datetime.utcnow()
            )
            db.session.add(code)
            db.session.commit()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def test_register_page_loads(self):
        response = self.client.get('/auth/register')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Create Your Account', response.data)

    def test_register_valid(self):
        data = {
            'username': 'newuser',
            'email': 'test2@example.com',
            'verificationCode': '654321',
            'password': TEST_PASSWORD,
            'confirmPassword': TEST_PASSWORD,
            'phone': '1234567890',
            'gender': 'male',
            'birthdate': '05/06/2025',
            'address': '123 Test St',
            'csrf_token': 'dummy_csrf_token'  # 视实际情况调整
        }
        # Simulate avatar upload
        data['avatar'] = (BytesIO(b'my file contents'), 'avatar.png')
        response = self.client.post('/auth/register', data=data, content_type='multipart/form-data', follow_redirects=True)
        self.assertIn(b'Login', response.data)  # Usually redirects to login page after successful registration

if __name__ == '__main__':
    unittest.main()

import unittest
from app import create_app, db
from models.user import User
from models.verification_code import VerificationCode
from werkzeug.security import generate_password_hash
from datetime import datetime
from io import BytesIO

class RegisterTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app('testing')
        self.client = self.app.test_client()
        with self.app.app_context():
            db.create_all()
            # 插入验证码
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
            'password': 'Test@1234',
            'confirmPassword': 'Test@1234',
            'phone': '1234567890',
            'gender': 'male',
            'birthdate': '05/06/2025',
            'address': '123 Test St',
            'csrf_token': 'dummy_csrf_token'  # 视实际情况调整
        }
        # 模拟上传头像
        data['avatar'] = (BytesIO(b'my file contents'), 'avatar.png')
        response = self.client.post('/auth/register', data=data, content_type='multipart/form-data', follow_redirects=True)
        self.assertIn(b'Login', response.data)  # 注册成功后通常会跳转到登录页面

if __name__ == '__main__':
    unittest.main()

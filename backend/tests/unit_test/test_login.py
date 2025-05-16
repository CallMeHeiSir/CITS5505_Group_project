import unittest
from app import create_app, db
from models.user import User
from models.verification_code import VerificationCode
from werkzeug.security import generate_password_hash
from datetime import datetime
import os
TEST_PASSWORD = os.environ['TEST_USER_PASSWORD']
NEW_PASSWORD = os.environ['NEW_USER_PASSWORD']

class LoginTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app('testing')  # 指定使用测试配置
        self.client = self.app.test_client()
        with self.app.app_context():
            db.create_all()
            # 插入测试用户
            user = User(
                username='testuser',
                email='test1@example.com',
                password_hash=generate_password_hash(TEST_PASSWORD)
            )
            db.session.add(user)
            # 插入验证码
            code = VerificationCode(
                email='test1@example.com',
                code='123456',
                created_at=datetime.utcnow()
            )
            db.session.add(code)
            db.session.commit()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def test_login_page_loads(self):
        response = self.client.get('/auth/login')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Login to Your Account', response.data)

    def test_login_valid(self):
        response = self.client.post('/auth/login', data={
            'username': 'testuser',
            'email': 'test@example.com',
            'verificationCode': '123456',
            'password': NEW_PASSWORD
        }, follow_redirects=True)
        self.assertIn(b'Login', response.data)  # 根据实际页面内容调整

if __name__ == '__main__':
    unittest.main()
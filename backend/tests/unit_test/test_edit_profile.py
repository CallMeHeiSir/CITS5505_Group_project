import unittest
import io
from app import create_app, db
from models.user import User
from werkzeug.security import generate_password_hash
from flask_login import login_user
from flask import url_for
import os
TEST_PASSWORD = os.environ['TEST_USER_PASSWORD']

class EditProfileTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app('testing')
        self.app.config['AVATAR_FOLDER'] = 'backend/static/avatars/'  # 添加这一行
        os.makedirs(self.app.config['AVATAR_FOLDER'], exist_ok=True)  # 确保目录存在
        self.client = self.app.test_client()
        with self.app.app_context():
            db.create_all()
            # 创建测试用户
            user = User(
                username='testuser',
                email='test1@example.com',
                password_hash=generate_password_hash(TEST_PASSWORD)
            )
            db.session.add(user)
            db.session.commit()
            self.user_id = user.id

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def login(self):
        # 直接登录用户（绕过登录页面）
        with self.app.test_request_context():
            user = User.query.get(self.user_id)
            login_user(user)

    def test_update_profile_success(self):
        with self.app.app_context():
            self.login()
            data = {
                'username': 'newuser',
                'email': 'newemail@example.com',
                'phone_number': '1234567890',
                'gender': 'male',
                'birthdate': '2000-01-01',
                'address': 'Test Address'
            }
            response = self.client.post('/update_profile', data=data, follow_redirects=True)
            self.assertEqual(response.status_code, 200)
            self.assertIn(b'success', response.data)
            # 检查数据库
            user = User.query.get(self.user_id)
            self.assertEqual(user.username, 'newuser')
            self.assertEqual(user.email, 'newemail@example.com')
            self.assertEqual(user.phone_number, '1234567890')
            self.assertEqual(user.gender, 'male')
            self.assertEqual(str(user.birthdate), '2000-01-01')
            self.assertEqual(user.address, 'Test Address')

    def test_update_profile_duplicate_email(self):
        with self.app.app_context():
            # 新增一个用户
            user2 = User(
                username='otheruser',
                email='other@example.com',
                password_hash=generate_password_hash('otherpassword')
            )
            db.session.add(user2)
            db.session.commit()
        with self.app.app_context():
            self.login()
            data = {
                'username': 'testuser',
                'email': 'other@example.com',  # 已存在邮箱
            }
            response = self.client.post('/update_profile', data=data)
            self.assertEqual(response.status_code, 400)
            self.assertIn(b'Email already exists', response.data)

    def test_update_profile_duplicate_username(self):
        with self.app.app_context():
            user2 = User(
                username='otheruser',
                email='other@example.com',
                password_hash=generate_password_hash('otherpassword')
            )
            db.session.add(user2)
            db.session.commit()
        with self.app.app_context():
            self.login()
            data = {
                'username': 'otheruser',  # 已存在用户名
                'email': 'test1@example.com',
            }
            response = self.client.post('/update_profile', data=data)
            self.assertEqual(response.status_code, 400)
            self.assertIn(b'Username already exists', response.data)

    def test_update_profile_avatar(self):
        with self.app.app_context():
            self.login()
            data = {
                'username': 'testuser',
                'email': 'test1@example.com',
            }
            # 模拟上传图片
            data['avatar'] = (io.BytesIO(b'my file contents'), 'test.png')
            response = self.client.post('/update_profile', data=data, content_type='multipart/form-data')
            self.assertEqual(response.status_code, 200)
            self.assertIn(b'success', response.data)
            user = User.query.get(self.user_id)
            self.assertEqual(user.avatar, 'test.png')


if __name__ == '__main__':
    unittest.main()

import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
import time
from app import create_app, db
from models.user import User
from models.verification_code import VerificationCode
from werkzeug.security import generate_password_hash
from datetime import datetime
import threading

class SeleniumLoginTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # 启动Flask测试环境
        cls.app = create_app('testing')
        cls.app_context = cls.app.app_context()
        cls.app_context.push()
        db.create_all()
        # 插入测试用户和验证码
        user = User(
            username='testuser',
            email='test1@example.com',
            password_hash=generate_password_hash('testpassword')
        )
        db.session.add(user)
        code = VerificationCode(
            email='test1@example.com',
            code='bypass',  # 如果后端有验证码绕过机制
            created_at=datetime.utcnow()
        )
        db.session.add(code)
        db.session.commit()

        # 启动 Flask 服务（后台线程，端口5001，避免与开发端口冲突）
        def run_app():
            cls.app.run(port=5001, use_reloader=False)
        cls.server_thread = threading.Thread(target=run_app)
        cls.server_thread.setDaemon(True)
        cls.server_thread.start()
        time.sleep(1)  # 等待服务启动

        # 启动浏览器
        cls.driver = webdriver.Chrome()
        cls.driver.implicitly_wait(5)

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()
        db.session.remove()
        db.drop_all()
        cls.app_context.pop()
        # Flask线程会自动退出（因为是守护线程）

    def test_login(self):
        driver = self.driver
        driver.get("http://127.0.0.1:5001/auth/login")
        driver.find_element(By.ID, "username").send_keys("testuser")
        driver.find_element(By.ID, "email").send_keys("test1@example.com")
        driver.find_element(By.ID, "verificationCode").send_keys("bypass")
        driver.find_element(By.ID, "password").send_keys("testpassword")
        driver.find_element(By.ID, "LoginButton").click()
        time.sleep(2)
        self.assertTrue("Login" not in driver.title or "dashboard" in driver.current_url)

if __name__ == "__main__":
    unittest.main()
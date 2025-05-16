import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
import time
from app import create_app, db
from models.user import User
from models.verification_code import VerificationCode
from datetime import datetime
import threading

class SeleniumRegisterTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # 启动Flask测试环境
        cls.app = create_app('testing')
        cls.app.config['AVATAR_FOLDER'] = 'static/avatars'  # 避免KeyError
        cls.app_context = cls.app.app_context()
        cls.app_context.push()
        db.create_all()
        # 插入验证码
        code = VerificationCode(
            email='test2@example.com',
            code='654321',
            created_at=datetime.utcnow()
        )
        db.session.add(code)
        db.session.commit()

        # 启动 Flask 服务（后台线程，端口5002，避免与开发端口冲突）
        def run_app():
            cls.app.run(port=5002, use_reloader=False)
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

    def test_register(self):
        driver = self.driver
        driver.get("http://127.0.0.1:5002/auth/register")
        driver.find_element(By.ID, "username").send_keys("newuser")
        driver.find_element(By.ID, "email").send_keys("test2@example.com")
        driver.find_element(By.ID, "verificationCode").send_keys("654321")
        driver.find_element(By.ID, "password").send_keys("Test@1234")
        driver.find_element(By.ID, "confirmPassword").send_keys("Test@1234")
        driver.find_element(By.ID, "phone").send_keys("1234567890")
        driver.find_element(By.ID, "gender").send_keys("male")
        driver.execute_script("document.getElementById('birthdate').value = '2025-05-16'")
        driver.find_element(By.ID, "address").send_keys("123 Test St")
        # 不上传头像，避免KeyError
        driver.find_element(By.ID, "registerButton").click()
        time.sleep(2)
        # 检查是否跳转到登录页或有注册成功提示
        self.assertTrue("login" in driver.current_url or "Registration successful" in driver.page_source)

if __name__ == "__main__":
    unittest.main()

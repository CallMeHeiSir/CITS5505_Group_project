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
import os
TEST_PASSWORD = os.environ['TEST_USER_PASSWORD']
NEW_PASSWORD = os.environ['NEW_USER_PASSWORD']

# Login Test
class SeleniumLoginTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app('testing')
        cls.app_context = cls.app.app_context()
        cls.app_context.push()
        db.create_all()
        user = User(username='testuser', email='test1@example.com', password_hash=generate_password_hash(TEST_PASSWORD))
        db.session.add(user)
        code = VerificationCode(email='test1@example.com', code='bypass', created_at=datetime.utcnow())
        db.session.add(code)
        db.session.commit()
        def run_app():
            cls.app.run(port=5001, use_reloader=False)
        cls.server_thread = threading.Thread(target=run_app)
        cls.server_thread.setDaemon(True)
        cls.server_thread.start()
        time.sleep(1)
        cls.driver = webdriver.Chrome()
        cls.driver.implicitly_wait(5)
    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()
        db.session.remove()
        db.drop_all()
        cls.app_context.pop()
    def test_login(self):
        driver = self.driver
        driver.get("http://127.0.0.1:5001/auth/login")
        driver.find_element(By.ID, "username").send_keys("testuser")
        driver.find_element(By.ID, "email").send_keys("test1@example.com")
        driver.find_element(By.ID, "verificationCode").send_keys("bypass")
        driver.find_element(By.ID, "password").send_keys(TEST_PASSWORD)
        driver.find_element(By.ID, "LoginButton").click()
        time.sleep(2)
        self.assertTrue("Login" not in driver.title or "dashboard" in driver.current_url)

if __name__ == "__main__":
    unittest.main()
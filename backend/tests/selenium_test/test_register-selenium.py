import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
import time
from app import create_app, db
from models.user import User
from models.verification_code import VerificationCode
from datetime import datetime
import threading
import os
TEST_PASSWORD = os.environ['TEST_USER_PASSWORD']
NEW_PASSWORD = os.environ['NEW_USER_PASSWORD']

# Register Test
class SeleniumRegisterTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app('testing')
        cls.app.config['AVATAR_FOLDER'] = 'static/avatars'
        cls.app_context = cls.app.app_context()
        cls.app_context.push()
        db.create_all()
        code = VerificationCode(email='test2@example.com', code='654321', created_at=datetime.utcnow())
        db.session.add(code)
        db.session.commit()
        def run_app():
            cls.app.run(port=5002, use_reloader=False)
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
    def test_register(self):
        driver = self.driver
        driver.get("http://127.0.0.1:5002/auth/register")
        driver.find_element(By.ID, "username").send_keys("newuser")
        driver.find_element(By.ID, "email").send_keys("test2@example.com")
        driver.find_element(By.ID, "verificationCode").send_keys("654321")
        driver.find_element(By.ID, "password").send_keys(TEST_PASSWORD)
        driver.find_element(By.ID, "confirmPassword").send_keys(TEST_PASSWORD)
        driver.find_element(By.ID, "phone").send_keys("1234567890")
        driver.find_element(By.ID, "gender").send_keys("male")
        driver.execute_script("document.getElementById('birthdate').value = '2025-05-16'")
        driver.find_element(By.ID, "address").send_keys("123 Test St")
        driver.find_element(By.ID, "registerButton").click()
        time.sleep(2)
        self.assertTrue("login" in driver.current_url or "Registration successful" in driver.page_source)


if __name__ == "__main__":
    unittest.main()

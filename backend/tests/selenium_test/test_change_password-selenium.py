import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
import time
from app import create_app, db
from models.user import User
from werkzeug.security import generate_password_hash
import threading
import os
TEST_PASSWORD = os.environ['TEST_USER_PASSWORD']
NEW_PASSWORD = os.environ['NEW_USER_PASSWORD']

class SeleniumChangePasswordTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app('testing')
        cls.app_context = cls.app.app_context()
        cls.app_context.push()
        db.create_all()
        user = User(username='testuser', email='test1@example.com', password_hash=generate_password_hash(TEST_PASSWORD))
        db.session.add(user)
        db.session.commit()
        def run_app():
            cls.app.run(port=5004, use_reloader=False)
        cls.server_thread = threading.Thread(target=run_app)
        cls.server_thread.setDaemon(True)
        cls.server_thread.start()
        time.sleep(5)
        cls.driver = webdriver.Chrome()
        cls.driver.implicitly_wait(5)
    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()
        db.session.remove()
        db.drop_all()
        cls.app_context.pop()
    def login(self):
        driver = self.driver
        driver.get("http://127.0.0.1:5004/auth/login")
        driver.find_element(By.ID, "username").send_keys("testuser")
        driver.find_element(By.ID, "email").send_keys("test1@example.com")
        driver.find_element(By.ID, "verificationCode").send_keys("bypass")
        driver.find_element(By.ID, "password").send_keys(TEST_PASSWORD)
        driver.find_element(By.ID, "LoginButton").click()
        time.sleep(1)
    def test_change_password(self):
        self.login()
        driver = self.driver
        driver.get("http://127.0.0.1:5004/auth/change_password")
        driver.find_element(By.ID, "current_password").send_keys(TEST_PASSWORD)
        driver.find_element(By.ID, "new_password").send_keys(NEW_PASSWORD)
        driver.find_element(By.ID, "confirm_new_password").send_keys(NEW_PASSWORD)
        driver.find_element(By.XPATH, "//button[@type='submit']").click()
        time.sleep(2)
        self.assertTrue("Password changed successfully" in driver.page_source)

if __name__ == "__main__":
    unittest.main()

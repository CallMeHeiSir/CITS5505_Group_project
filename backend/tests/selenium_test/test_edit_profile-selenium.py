import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
import time
from app import create_app, db
from models.user import User
from models.verification_code import VerificationCode
from werkzeug.security import generate_password_hash
from datetime import datetime
import threading
import os
TEST_PASSWORD = os.environ['TEST_USER_PASSWORD']


# This test case uses Selenium to test the edit profile functionality in the web application.
# It includes setup and teardown for the test environment, user login, and the profile editing process.
class SeleniumEditProfileTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Set up the Flask app and test database for Selenium tests
        cls.app = create_app('testing')
        cls.app.config['AVATAR_FOLDER'] = 'backend/static/avatars/'
        os.makedirs(cls.app.config['AVATAR_FOLDER'], exist_ok=True)
        cls.app_context = cls.app.app_context()
        cls.app_context.push()
        db.create_all()
        # Create a test user and verification code
        user = User(username='testuser', email='test1@example.com', password_hash=generate_password_hash(TEST_PASSWORD))
        db.session.add(user)
        code = VerificationCode(email='test1@example.com', code='bypass', created_at=datetime.utcnow())
        db.session.add(code)
        db.session.commit()
        def run_app():
            cls.app.run(port=5005, use_reloader=False)
        cls.server_thread = threading.Thread(target=run_app)
        cls.server_thread.setDaemon(True)
        cls.server_thread.start()
        time.sleep(1.5)
        cls.driver = webdriver.Chrome()
        cls.driver.implicitly_wait(5)
    @classmethod
    def tearDownClass(cls):
        # Clean up after all tests
        cls.driver.quit()
        db.session.remove()
        db.drop_all()
        cls.app_context.pop()
    def login(self):
        # Log in as the test user before editing profile
        driver = self.driver
        driver.get("http://127.0.0.1:5005/auth/logout")
        time.sleep(0.5)
        driver.get("http://127.0.0.1:5005/auth/login")
        driver.find_element(By.ID, "username").send_keys("testuser")
        driver.find_element(By.ID, "email").send_keys("test1@example.com")
        driver.find_element(By.ID, "verificationCode").send_keys("bypass")
        driver.find_element(By.ID, "password").send_keys(TEST_PASSWORD)
        driver.find_element(By.ID, "LoginButton").click()
        time.sleep(1.5)
    def test_edit_profile(self):
        # Test the edit profile process
        driver = self.driver
        self.login()
        driver.get("http://127.0.0.1:5005/settings")
        time.sleep(1)
        driver.find_element(By.ID, "username").clear()
        driver.find_element(By.ID, "username").send_keys("newuser")
        driver.find_element(By.ID, "email").clear()
        driver.find_element(By.ID, "email").send_keys("newemail@example.com")
        driver.find_element(By.ID, "phone").clear()
        driver.find_element(By.ID, "phone").send_keys("1234567890")
        Select(driver.find_element(By.ID, "gender")).select_by_value("female")
        driver.find_element(By.ID, "birthdate").clear()
        driver.execute_script("document.getElementById('birthdate').value = '1999-12-31';")
        driver.find_element(By.ID, "address").clear()
        driver.find_element(By.ID, "address").send_keys("Test Address")
        driver.find_element(By.CSS_SELECTOR, "form#profile-form button[type='submit']").click()
        time.sleep(5)
        self.assertTrue("Profile updated successfully" in driver.page_source or "success" in driver.page_source)

if __name__ == "__main__":
    # Run the Selenium edit profile test case
    unittest.main()

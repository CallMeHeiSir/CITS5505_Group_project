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
NEW_PASSWORD = os.environ['NEW_USER_PASSWORD']

# 登录测试
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

# 注册测试
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

# 找回密码测试
class SeleniumRetrievePasswordTestCase(unittest.TestCase):
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
            cls.app.run(port=5003, use_reloader=False)
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
    def test_retrieve_password(self):
        driver = self.driver
        driver.get("http://127.0.0.1:5003/auth/retrieve_password")
        driver.find_element(By.ID, "username").send_keys("testuser")
        driver.find_element(By.ID, "email").send_keys("test1@example.com")
        driver.find_element(By.ID, "new_password").send_keys(NEW_PASSWORD)
        driver.find_element(By.ID, "confirm_new_password").send_keys(NEW_PASSWORD)
        driver.find_element(By.XPATH, "//button[@type='submit']").click()
        time.sleep(5)
        self.assertTrue("Password retrieved successfully" in driver.page_source)

# 修改密码测试
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

# 编辑个人信息测试
class SeleniumEditProfileTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app('testing')
        cls.app.config['AVATAR_FOLDER'] = 'backend/static/avatars/'
        os.makedirs(cls.app.config['AVATAR_FOLDER'], exist_ok=True)
        cls.app_context = cls.app.app_context()
        cls.app_context.push()
        db.create_all()
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
        cls.driver.quit()
        db.session.remove()
        db.drop_all()
        cls.app_context.pop()
    def login(self):
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
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    suite.addTests(loader.loadTestsFromTestCase(SeleniumRegisterTestCase))
    suite.addTests(loader.loadTestsFromTestCase(SeleniumLoginTestCase))
    suite.addTests(loader.loadTestsFromTestCase(SeleniumRetrievePasswordTestCase))
    suite.addTests(loader.loadTestsFromTestCase(SeleniumEditProfileTestCase))
    suite.addTests(loader.loadTestsFromTestCase(SeleniumChangePasswordTestCase))
    runner = unittest.TextTestRunner(verbosity=2)
    runner.run(suite)
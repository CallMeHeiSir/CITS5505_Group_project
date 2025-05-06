import { loginUser, registerUser } from './api.js'; // Modified: Import API functions for backend requests
import { validateEmail, validatePassword } from './utils.js'; // Modified: Import validation functions

// Wait for the DOM to be fully loaded before executing the code
document.addEventListener('DOMContentLoaded', function() {
  // Get form elements for login and registration
  const loginForm = document.getElementById('loginForm'); // Modified: Updated ID to match login.html
  const registerForm = document.getElementById('registerForm'); // Modified: Updated ID to match register.html

  // Modified: Check if forms exist to avoid null errors
  if (loginForm) {
    // Handle login form submission
    loginForm.addEventListener('submit', async function(e) { // Modified: Added async for API calls
      e.preventDefault();
      // Get email and password from the form
      const email = this.querySelector('#email').value; // Modified: Use specific ID selector
      const password = this.querySelector('#password').value;

      // Modified: Validate email
      if (!validateEmail(email)) {
        alert('请输入有效的邮箱地址（包含@）');
        this.querySelector('#email').classList.add('is-invalid');
        document.getElementById('emailError').style.display = 'block';
        return;
      }

      // Modified: Send login request to backend
      try {
        const result = await loginUser({ email, password });
        if (result.message) {
          alert(result.message);
          window.location.href = '/'; // Modified: Redirect to index.html on success
        } else {
          alert(result.error);
          this.querySelector('#email').classList.add('is-invalid');
          document.getElementById('emailError').style.display = 'block';
        }
      } catch (error) {
        alert('登录失败: ' + error.message); // Modified: Handle network or server errors
      }
    });
  }

  // Modified: Check if register form exists to avoid null errors
  if (registerForm) {
    // Handle registration form submission
    registerForm.addEventListener('submit', async function(e) { // Modified: Added async for API calls
      e.preventDefault();
      // Get user registration details from the form
      const username = this.querySelector('#username').value; // Modified: Use specific ID selector
      const email = this.querySelector('#email').value;
      const password = this.querySelector('#password').value;
      const phone = this.querySelector('#phone').value; // Modified: Added fields from register.html
      const gender = this.querySelector('#gender').value;
      const birthdate = this.querySelector('#birthdate').value;
      const address = this.querySelector('#address').value;
      const avatarPath = this.querySelector('#avatarPreview').src ? '/static/uploads/' + this.querySelector('#avatarPreview').src.split('/').pop() : ''; // Modified: Handle avatar upload

      // Modified: Validate inputs
      if (!username || !email || !password) {
        alert('用户名、邮箱和密码为必填项');
        return;
      }
      if (!validateEmail(email)) {
        alert('请输入有效的邮箱地址（包含@）');
        return;
      }
      if (!validatePassword(password)) {
        alert('密码需至少6个字符并包含特殊字符');
        this.querySelector('#password').classList.add('is-invalid');
        document.getElementById('passwordError').style.display = 'block';
        return;
      }

      // Modified: Send registration request to backend
      const formData = {
        username,
        email,
        password,
        phone,
        gender,
        birthdate,
        address,
        avatar_path: avatarPath
      };

      try {
        const result = await registerUser(formData);
        if (result.message) {
          alert('注册成功，请登录！');
          window.location.href = '/login'; // Modified: Redirect to login page on success
          this.reset();
        } else {
          alert(result.error);
        }
      } catch (error) {
        alert('注册失败: ' + error.message); // Modified: Handle network or server errors
      }
    });
  }
});
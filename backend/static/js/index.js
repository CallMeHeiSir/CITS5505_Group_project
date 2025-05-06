import { loginUser, registerUser } from './api.js';
import { validateEmail, validatePassword } from './utils.js';

document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const avatarInput = document.getElementById('avatar');
  const avatarUploadZone = document.getElementById('avatarUploadZone');
  let avatarPath = ''; // 用于存储上传后的头像路径

  // 头像上传功能
  if (avatarInput && avatarUploadZone) {
    avatarInput.addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const avatarPreview = document.getElementById('avatarPreview');
          avatarPreview.src = e.target.result;
          avatarPreview.style.display = 'block';
          avatarUploadZone.querySelector('p').style.display = 'none';
        };
        reader.readAsDataURL(file);

        const formData = new FormData();
        formData.append('avatar', file);
        try {
          const response = await fetch('/api/upload-avatar', {
            method: 'POST',
            body: formData
          });
          const result = await response.json();
          if (result.avatar_path) {
            avatarPath = result.avatar_path;
            console.log('Avatar uploaded successfully:', avatarPath);
          } else {
            alert('上传失败: ' + result.error);
          }
        } catch (error) {
          alert('上传失败: ' + error.message);
        }
      } else {
        alert('请选择有效的图片文件');
      }
    });

    avatarUploadZone.addEventListener('dragover', (event) => {
      event.preventDefault();
      avatarUploadZone.classList.add('dragover');
    });

    avatarUploadZone.addEventListener('dragleave', () => {
      avatarUploadZone.classList.remove('dragover');
    });

    avatarUploadZone.addEventListener('drop', async (event) => {
      event.preventDefault();
      avatarUploadZone.classList.remove('dragover');
      const file = event.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const avatarPreview = document.getElementById('avatarPreview');
          avatarPreview.src = e.target.result;
          avatarPreview.style.display = 'block';
          avatarUploadZone.querySelector('p').style.display = 'none';
        };
        reader.readAsDataURL(file);

        const formData = new FormData();
        formData.append('avatar', file);
        try {
          const response = await fetch('/api/upload-avatar', {
            method: 'POST',
            body: formData
          });
          const result = await response.json();
          if (result.avatar_path) {
            avatarPath = result.avatar_path;
            console.log('Avatar uploaded successfully:', avatarPath);
          } else {
            alert('上传失败: ' + result.error);
          }
        } catch (error) {
          alert('上传失败: ' + error.message);
        }
      } else {
        alert('请选择有效的图片文件');
      }
    });

    avatarUploadZone.addEventListener('click', () => {
      avatarInput.click();
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const email = this.querySelector('#email').value;
      const password = this.querySelector('#password').value;

      if (!email.includes('@')) {
        alert('请输入有效的邮箱地址（包含@）');
        this.querySelector('#email').classList.add('is-invalid');
        document.getElementById('emailError').style.display = 'block';
        return;
      }

      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const result = await response.json();

        if (response.ok) {
          alert(result.message);
          window.location.href = '/upload.html';
        } else {
          alert(result.error || '登录失败');
          this.querySelector('#email').classList.add('is-invalid');
          document.getElementById('emailError').style.display = 'block';
        }
      } catch (err) {
        alert('登录出错: ' + err.message);
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const username = this.querySelector('#username').value;
      const email = this.querySelector('#email').value;
      const password = this.querySelector('#password').value;
      const phone = this.querySelector('#phone').value;
      const gender = this.querySelector('#gender').value;
      const birthdate = this.querySelector('#birthdate').value;
      const address = this.querySelector('#address').value;

      if (!username || !email || !password) {
        alert('用户名、邮箱和密码为必填项');
        return;
      }

      const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
      if (password.length < 6 || !specialCharRegex.test(password)) {
        alert('密码需至少6个字符并包含特殊字符');
        this.querySelector('#password').classList.add('is-invalid');
        document.getElementById('passwordError').style.display = 'block';
        return;
      }

      const formData = {
        username,
        email,
        password,
        phone,
        gender,
        birthdate,
        address,
        avatar_path: avatarPath || ''
      };

      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const result = await response.json();

        if (response.ok) {
          alert('注册成功，请登录！');
          window.location.href = '/login.html';
          this.reset();
        } else {
          alert(result.error || '注册失败');
        }
      } catch (error) {
        alert('注册出错: ' + error.message);
      }
    });
  }
});

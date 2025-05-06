import { loginUser, registerUser } from './api.js';
import { validateEmail, validatePassword } from './utils.js';

document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const avatarInput = document.getElementById('avatar');
  const avatarUploadZone = document.getElementById('avatarUploadZone');
  let avatarPath = ''; // 用于存储上传后的头像路径

  // 移动端导航栏折叠功能
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }

  // 头像上传功能
  if (avatarInput && avatarUploadZone) {
    // 点击上传
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

        // 上传文件到后端
        const formData = new FormData();
        formData.append('avatar', file);
        try {
          const response = await fetch('/api/upload-avatar', {
            method: 'POST',
            body: formData
          });
          const result = await response.json();
          if (result.avatar_path) {
            avatarPath = result.avatar_path; // 存储头像路径
            console.log('Avatar uploaded successfully:', avatarPath);
          } else {
            console.error('Upload failed:', result.error);
            alert('上传失败: ' + result.error);
          }
        } catch (error) {
          console.error('Upload error:', error);
          alert('上传失败: ' + error.message);
        }
      } else {
        alert('请选择有效的图片文件');
      }
    });

    // 拖拽上传
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
        const fileList = new DataTransfer();
        fileList.items.add(file);
        avatarInput.files = fileList.files;

        const reader = new FileReader();
        reader.onload = (e) => {
          const avatarPreview = document.getElementById('avatarPreview');
          avatarPreview.src = e.target.result;
          avatarPreview.style.display = 'block';
          avatarUploadZone.querySelector('p').style.display = 'none';
        };
        reader.readAsDataURL(file);

        // 上传文件到后端
        const formData = new FormData();
        formData.append('avatar', file);
        try {
          const response = await fetch('/api/upload-avatar', {
            method: 'POST',
            body: formData
          });
          const result = await response.json();
          if (result.avatar_path) {
            avatarPath = result.avatar_path; // 存储头像路径
            console.log('Avatar uploaded successfully:', avatarPath);
          } else {
            console.error('Upload failed:', result.error);
            alert('上传失败: ' + result.error);
          }
        } catch (error) {
          console.error('Upload error:', error);
          alert('上传失败: ' + error.message);
        }
      } else {
        alert('请选择有效的图片文件');
      }
    });

    // 点击上传区域触发文件选择
    avatarUploadZone.addEventListener('click', () => {
      avatarInput.click();
    });
  } else {
    console.error('Avatar input or upload zone not found');
  }

  // 登录表单
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const email = this.querySelector('#email').value;
      const password = this.querySelector('#password').value;

      if (!validateEmail(email)) {
        alert('请输入有效的邮箱地址（包含@）');
        this.querySelector('#email').classList.add('is-invalid');
        document.getElementById('emailError').style.display = 'block';
        return;
      }

      try {
        const result = await loginUser({ email, password });
        if (result.message) {
          alert(result.message);
          window.location.href = '/';
        } else {
          alert(result.error);
          this.querySelector('#email').classList.add('is-invalid');
          document.getElementById('emailError').style.display = 'block';
        }
      } catch (error) {
        alert('登录失败: ' + error.message);
      }
    });
  }

  // 注册表单
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
        const result = await registerUser(formData);
        if (result.message) {
          alert('注册成功，请登录！');
          window.location.href = '/login';
          this.reset();
        } else {
          alert(result.error);
        }
      } catch (error) {
        alert('注册失败: ' + error.message);
      }
    });
  }
});
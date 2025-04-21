document.addEventListener('DOMContentLoaded', function() {
  // 获取表单元素
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  // 处理登录表单提交
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = this.querySelector('input[type="email"]').value;
    const password = this.querySelector('input[type="password"]').value;

    // TODO: 发送登录请求到后端
    console.log('Login attempt:', { email, password });
    
    // 模拟登录成功
    window.location.href = 'upload.html';
  });

  // 处理注册表单提交
  registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = this.querySelector('input[type="text"]').value;
    const email = this.querySelector('input[type="email"]').value;
    const password = this.querySelector('input[type="password"]').value;

    // TODO: 发送注册请求到后端
    console.log('Register attempt:', { username, email, password });
    
    // 模拟注册成功
    alert('Registration successful! Please login.');
    this.reset();
  });
}); 
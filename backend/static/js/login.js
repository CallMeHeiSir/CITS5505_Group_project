document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const usernameError = document.getElementById('usernameError');
    const passwordInput = document.getElementById('password');
    const passwordError = document.getElementById('passwordError');

    // 功能 1：用户名验证
    // 验证用户名是否为空
    usernameInput.addEventListener('input', () => {
        const username = usernameInput.value.trim();
        const isValid = username.length > 0;

        if (!isValid) {
            usernameInput.classList.add('is-invalid');
            usernameError.style.display = 'block';
        } else {
            usernameInput.classList.remove('is-invalid');
            usernameError.style.display = 'none';
        }
    });

    // 功能 2：密码验证
    // 验证密码是否为空
    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value.trim();
        const isValid = password.length > 0;

        if (!isValid) {
            passwordInput.classList.add('is-invalid');
            passwordError.style.display = 'block';
        } else {
            passwordInput.classList.remove('is-invalid');
            passwordError.style.display = 'none';
        }
    });

    // 功能 3：关闭 Flash 消息
    document.querySelectorAll('.flash-close').forEach(button => {
        button.addEventListener('click', () => {
            button.parentElement.style.display = 'none';
        });
    });
});

 document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const sendCodeButton = document.getElementById('sendCodeButton');
    const LoginButton = document.getElementById('LoginButton');

    // 点击“Send Code”按钮时，发送验证码请求
    sendCodeButton.addEventListener('click', (event) => {
        event.preventDefault(); // 阻止默认表单提交行为

        // 获取用户输入的邮箱
        const emailInput = document.getElementById('email').value.trim();
        if (!emailInput) {
            alert('Please enter your email before requesting a verification code.');
            return;
        }

        // 创建一个表单数据对象
        const formData = new FormData();
        formData.append('email', emailInput);

         // 禁用按钮并开始倒计时
    let countdown = 60; // 倒计时秒数
    sendCodeButton.disabled = true;
    sendCodeButton.textContent = `Resend (${countdown}s)`;

    const timer = setInterval(() => {
        countdown -= 1;
        sendCodeButton.textContent = `Resend (${countdown}s)`;

        if (countdown <= 0) {
            clearInterval(timer);
            sendCodeButton.disabled = false;
            sendCodeButton.textContent = 'Send Code';
        }
    }, 1000);

        // 发送验证码请求到后端
        fetch('/auth/send_verification_code', {
            method: 'POST',
            body: formData,
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to send verification code.');
                }
                return response.text(); // 后端可能返回 HTML 页面
            })
            .then(() => {
                alert('Verification code sent successfully. Please check your email.');
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while sending the verification code.');
            });
    });

    // 点击“Login”按钮时，提交表单到登录路径
    LoginButton.addEventListener('click', (event) => {
        event.preventDefault(); // 阻止默认表单提交行为

        // 验证表单是否填写完整
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const verificationCode = document.getElementById('verificationCode').value.trim();
        const password = document.getElementById('password').value.trim();
        

        if (!username || !email || !verificationCode || !password ) {
            alert('Please fill in all required fields.');
            return;
        }

        // 提交表单到登录路径
        form.action = '/auth/login'; // 设置登录路径
        form.method = 'POST'; // 确保使用 POST 方法
        form.submit(); // 提交表单
    });
});
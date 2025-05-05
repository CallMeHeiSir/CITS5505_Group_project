// 注册表单功能
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    const passwordInput = document.getElementById('password');
    const passwordError = document.getElementById('passwordError');
    const avatarInput = document.getElementById('avatar');
    const avatarPreview = document.getElementById('avatarPreview');
    const avatarUploadZone = document.getElementById('avatarUploadZone');

    // 功能 1：密码格式验证
    // 验证密码是否至少6个字符且包含特殊字符
    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/; // 特殊字符正则表达式
        const isValid = password.length >= 6 && specialCharRegex.test(password);

        if (!isValid) {
            passwordInput.classList.add('is-invalid');
            passwordError.style.display = 'block';
        } else {
            passwordInput.classList.remove('is-invalid');
            passwordError.style.display = 'none';
        }
    });

    // 功能 2：Avatar 上传预览
    // 当用户选择文件时，显示图像预览
    avatarInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                avatarPreview.src = e.target.result;
                avatarPreview.style.display = 'block';
                avatarUploadZone.querySelector('p').style.display = 'none'; // 隐藏提示文字
            };
            reader.readAsDataURL(file);
        }
    });

    // 功能 3：表单提交提示
    // 模拟提交，显示成功提示
    form.addEventListener('submit', (event) => {
        event.preventDefault(); // 阻止默认提交

        // 检查密码是否通过验证
        const password = passwordInput.value;
        const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
        if (password.length < 6 || !specialCharRegex.test(password)) {
            passwordInput.classList.add('is-invalid');
            passwordError.style.display = 'block';
            return;
        }

        // 显示成功提示
        alert('Registration successful! (This is a simulation)');
    });
});
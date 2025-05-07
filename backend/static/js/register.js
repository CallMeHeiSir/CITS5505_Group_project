document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    const passwordInput = document.getElementById('password');
    const passwordError = document.getElementById('passwordError');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const confirmPasswordError = document.getElementById('confirmPasswordError');
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

    // 确认密码验证
    confirmPasswordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        if (password !== confirmPassword) {
            confirmPasswordError.style.display = 'block';
        } else {
            confirmPasswordError.style.display = 'none';
        }
    });

    // 密码显示/隐藏功能
    const togglePasswordVisibility = (inputId, toggleIconId) => {
        const input = document.getElementById(inputId);
        const toggleIcon = document.getElementById(toggleIconId);

        toggleIcon.addEventListener('click', () => {
            const isPassword = input.getAttribute('type') === 'password';
            input.setAttribute('type', isPassword ? 'text' : 'password');
            toggleIcon.textContent = isPassword ? '👁️‍🗨️' : '👁️';
        });
    };

    // 添加眼睛图标功能
    togglePasswordVisibility('password', 'togglePassword');
    togglePasswordVisibility('confirmPassword', 'toggleConfirmPassword');

    // 功能 2：Avatar 上传预览
    // 使整个 upload-zone 可点击
    avatarUploadZone.addEventListener('click', (event) => {
        // 避免重复触发（如果点击的是 input 本身）
        if (event.target !== avatarInput) {
            avatarInput.click();
        }
    });

    // 当用户选择文件时，显示图像预览
    const handleFileSelect = (file) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                avatarPreview.src = e.target.result;
                avatarPreview.style.display = 'block';
                avatarUploadZone.querySelector('p').style.display = 'none'; // 隐藏提示文字
                avatarUploadZone.querySelector('.upload-icon').style.display = 'none'; // 隐藏上传图标
            };
            reader.readAsDataURL(file);
        }
    };

    // 点击上传
    avatarInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        handleFileSelect(file);
    });

    // 拖放上传
    avatarUploadZone.addEventListener('dragover', (event) => {
        event.preventDefault();
        avatarUploadZone.classList.add('dragover');
    });

    avatarUploadZone.addEventListener('dragleave', (event) => {
        event.preventDefault();
        avatarUploadZone.classList.remove('dragover');
    });

    avatarUploadZone.addEventListener('drop', (event) => {
        event.preventDefault();
        avatarUploadZone.classList.remove('dragover');
        const file = event.dataTransfer.files[0];
        handleFileSelect(file);
        // 更新 input 的文件（以便表单提交时包含文件）
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        avatarInput.files = dataTransfer.files;
    });

    // 功能 3：关闭 Flash 消息
    document.querySelectorAll('.flash-close').forEach(button => {
        button.addEventListener('click', () => {
            button.parentElement.style.display = 'none';
        });
    });
});
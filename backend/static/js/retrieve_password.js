document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('new_password');
    const passwordError = document.getElementById('new_passwordError');

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
    // 切换密码显示/隐藏功能
    const togglePasswordVisibility = (inputId, toggleIconId) => {
        const input = document.getElementById(inputId);
        const toggleIcon = document.getElementById(toggleIconId);

        toggleIcon.addEventListener('click', () => {
            const isPassword = input.getAttribute('type') === 'password';
            input.setAttribute('type', isPassword ? 'text' : 'password');
            toggleIcon.classList.toggle('bi-eye');
            toggleIcon.classList.toggle('bi-eye-slash');
        });
    };

    // 为每个密码输入框添加切换功能
    togglePasswordVisibility('new_password', 'toggleNewPassword');
    togglePasswordVisibility('confirm_new_password', 'toggleConfirmPassword');
});
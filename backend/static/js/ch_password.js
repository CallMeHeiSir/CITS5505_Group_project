document.addEventListener('DOMContentLoaded', () => {
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
    togglePasswordVisibility('current_password', 'togglePassword');
    togglePasswordVisibility('new_password', 'toggleNewPassword');
    togglePasswordVisibility('confirm_password', 'toggleConfirmPassword');
});


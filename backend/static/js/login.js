// 登录表单功能
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('emailError');

    // 功能 1：邮箱格式验证
    // 验证邮箱是否包含 '@'
    emailInput.addEventListener('input', () => {
        const email = emailInput.value;
        const isValid = email.includes('@');

        if (!isValid) {
            emailInput.classList.add('is-invalid');
            emailError.style.display = 'block';
        } else {
            emailInput.classList.remove('is-invalid');
            emailError.style.display = 'none';
        }
    });

   
});
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

    // 功能 2：表单提交提示
    // 模拟登录，显示成功提示
    form.addEventListener('submit', (event) => {
        event.preventDefault(); // 阻止默认提交

        // 检查邮箱是否通过验证
        const email = emailInput.value;
        if (!email.includes('@')) {
            emailInput.classList.add('is-invalid');
            emailError.style.display = 'block';
            return;
        }

        // 显示成功提示
        alert('Login successful! (This is a simulation)');
    });
});
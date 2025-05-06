import { loginUser } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('emailError');

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

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const credentials = {
            email: emailInput.value,
            password: document.getElementById('password').value
        };

        if (!credentials.email.includes('@')) {
            emailInput.classList.add('is-invalid');
            emailError.style.display = 'block';
            return;
        }

        try {
            const result = await loginUser(credentials);
            if (result.message) {
                alert(result.message);
                window.location.href = '/'; // 跳转到 index.html
            } else {
                alert(result.error);
            }
        } catch (error) {
            alert('错误: ' + error.message);
        }
    });
});
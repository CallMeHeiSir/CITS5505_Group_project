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
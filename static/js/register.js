import { registerUser, uploadAvatar } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    const passwordInput = document.getElementById('password');
    const passwordError = document.getElementById('passwordError');
    const avatarInput = document.getElementById('avatar');
    const avatarPreview = document.getElementById('avatarPreview');
    const avatarUploadZone = document.getElementById('avatarUploadZone');
    let avatarPath = '';

    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
        const isValid = password.length >= 6 && specialCharRegex.test(password )
        if (!isValid) {
            passwordInput.classList.add('is-invalid');
            passwordError.style.display = 'block';
        } else {
            passwordInput.classList.remove('is-invalid');
            passwordError.style.display = 'none';
        }
    });

    avatarInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                avatarPreview.src = e.target.result;
                avatarPreview.style.display = 'block';
                avatarUploadZone.querySelector('p').style.display = 'none';
            };
            reader.readAsDataURL(file);

            const result = await uploadAvatar(file);
            if (result.avatar_path) {
                avatarPath = result.avatar_path;
            } else {
                alert(result.error);
            }
        }
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = {
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            password: passwordInput.value,
            phone: document.getElementById('phone').value,
            gender: document.getElementById('gender').value,
            birthdate: document.getElementById('birthdate').value,
            address: document.getElementById('address').value,
            avatar_path: avatarPath
        };

        const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
        if (formData.password.length < 6 || !specialCharRegex.test(formData.password)) {
            passwordInput.classList.add('is-invalid');
            passwordError.style.display = 'block';
            return;
        }

        try {
            const result = await registerUser(formData);
            if (result.message) {
                alert(result.message);
                window.location.href = '/login';
            } else {
                alert(result.error);
            }
        } catch (error) {
            alert('错误: ' + error.message);
        }
    });
});
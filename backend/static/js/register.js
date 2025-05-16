$(function () {
    const $form = $('#registerForm');
    const $passwordInput = $('#password');
    const $passwordError = $('#passwordError');
    const $confirmPasswordInput = $('#confirmPassword');
    const $confirmPasswordError = $('#confirmPasswordError');
    const $avatarInput = $('#avatar');
    const $avatarPreview = $('#avatarPreview');
    const $avatarUploadZone = $('#avatarUploadZone');
    const $sendCodeButton = $('#sendCodeButton');
    const $registerButton = $('#registerButton');
    const csrfToken = $('#csrf_token').val();

    // 功能 1：密码格式验证
    $passwordInput.on('input', function () {
        const password = $(this).val();
        const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
        const isValid = password.length >= 6 && specialCharRegex.test(password);

        if (!isValid) {
            $(this).addClass('is-invalid');
            $passwordError.show();
        } else {
            $(this).removeClass('is-invalid');
            $passwordError.hide();
        }
    });

    // 确认密码验证
    $confirmPasswordInput.on('input', function () {
        const password = $passwordInput.val();
        const confirmPassword = $(this).val();
        if (password !== confirmPassword) {
            $confirmPasswordError.show();
        } else {
            $confirmPasswordError.hide();
        }
    });

    // 密码显示/隐藏功能
    function togglePasswordVisibility(inputId, toggleIconId) {
        const $input = $('#' + inputId);
        const $toggleIcon = $('#' + toggleIconId);

        $toggleIcon.on('click', function () {
            const isPassword = $input.attr('type') === 'password';
            $input.attr('type', isPassword ? 'text' : 'password');
            $toggleIcon.text(isPassword ? '👁️‍🗨️' : '👁️');
        });
    }
    togglePasswordVisibility('password', 'togglePassword');
    togglePasswordVisibility('confirmPassword', 'toggleConfirmPassword');

    // 功能 2：Avatar 上传预览
    $avatarUploadZone.on('click', function (event) {
        if (event.target !== $avatarInput[0]) {
            $avatarInput.click();
        }
    });

    function handleFileSelect(file) {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function (e) {
                $avatarPreview.attr('src', e.target.result).show();
                $avatarUploadZone.find('p').hide();
                $avatarUploadZone.find('.upload-icon').hide();
            };
            reader.readAsDataURL(file);
        }
    }

    $avatarInput.on('change', function (event) {
        const file = event.target.files[0];
        handleFileSelect(file);
    });

    $avatarUploadZone.on('dragover', function (event) {
        event.preventDefault();
        $avatarUploadZone.addClass('dragover');
    });

    $avatarUploadZone.on('dragleave', function (event) {
        event.preventDefault();
        $avatarUploadZone.removeClass('dragover');
    });

    $avatarUploadZone.on('drop', function (event) {
        event.preventDefault();
        $avatarUploadZone.removeClass('dragover');
        const file = event.originalEvent.dataTransfer.files[0];
        handleFileSelect(file);
        // 更新 input 的文件
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        $avatarInput[0].files = dataTransfer.files;
    });

    // 功能 3：关闭 Flash 消息
    $('.flash-close').on('click', function () {
        $(this).parent().hide();
    });

    // 点击“Send Code”按钮时，发送验证码请求
    $sendCodeButton.on('click', function (event) {
        event.preventDefault();

        const emailInput = $('#email').val().trim();
        if (!emailInput) {
            alert('Please enter your email before requesting a verification code.');
            return;
        }

        const formData = new FormData();
        formData.append('email', emailInput);

        // 禁用按钮并开始倒计时
        let countdown = 60;
        $sendCodeButton.prop('disabled', true).text(`Resend (${countdown}s)`);
        const timer = setInterval(function () {
            countdown -= 1;
            $sendCodeButton.text(`Resend (${countdown}s)`);
            if (countdown <= 0) {
                clearInterval(timer);
                $sendCodeButton.prop('disabled', false).text('Send Code');
            }
        }, 1000);

        // 发送验证码请求到后端
        fetch('/auth/send_verification_code', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            body: formData,
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to send verification code.');
                }
                return response.text();
            })
            .then(() => {
                alert('Verification code sent successfully. Please check your email.');
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while sending the verification code.');
            });
    });

    // 点击“Register”按钮时，提交表单到注册路径
    $registerButton.on('click', function (event) {
        event.preventDefault();

        const username = $('#username').val().trim();
        const email = $('#email').val().trim();
        const verificationCode = $('#verificationCode').val().trim();
        const password = $passwordInput.val().trim();
        const confirmPassword = $confirmPasswordInput.val().trim();

        if (!username || !email || !verificationCode || !password || !confirmPassword) {
            alert('Please fill in all required fields.');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        $form.attr('action', '/auth/register');
        $form.attr('method', 'POST');
        $form.submit();
    });
});
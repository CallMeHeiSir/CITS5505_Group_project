$(function () {
    // 功能 1：用户名验证
    $('#username').on('input', function () {
        const username = $(this).val().trim();
        if (!username) {
            $(this).addClass('is-invalid');
            $('#usernameError').show();
        } else {
            $(this).removeClass('is-invalid');
            $('#usernameError').hide();
        }
    });

    // 功能 2：密码验证
    $('#password').on('input', function () {
        const password = $(this).val().trim();
        if (!password) {
            $(this).addClass('is-invalid');
            $('#passwordError').show();
        } else {
            $(this).removeClass('is-invalid');
            $('#passwordError').hide();
        }
    });

    // 功能 3：关闭 Flash 消息
    $('.flash-close').on('click', function () {
        $(this).parent().hide();
    });

    const csrfToken = $('#csrf_token').val();

    // 点击“Send Code”按钮时，发送验证码请求
    $('#sendCodeButton').on('click', function (event) {
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
        const $btn = $(this);
        $btn.prop('disabled', true).text(`Resend (${countdown}s)`);
        const timer = setInterval(function () {
            countdown -= 1;
            $btn.text(`Resend (${countdown}s)`);
            if (countdown <= 0) {
                clearInterval(timer);
                $btn.prop('disabled', false).text('Send Code');
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

    // 点击“Login”按钮时，提交表单到登录路径
    $('#LoginButton').on('click', function (event) {
        event.preventDefault();

        const username = $('#username').val().trim();
        const email = $('#email').val().trim();
        const verificationCode = $('#verificationCode').val().trim();
        const password = $('#password').val().trim();

        if (!username || !email || !verificationCode || !password) {
            alert('Please fill in all required fields.');
            return;
        }

        const $form = $('#loginForm');
        $form.attr('action', '/auth/login');
        $form.attr('method', 'POST');
        $form.submit();
    });
});

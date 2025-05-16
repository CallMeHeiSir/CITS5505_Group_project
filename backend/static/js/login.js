$(function () {
    // Feature 1: Username validation
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

    // Feature 2: Password validation
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

    // Feature 3: Close Flash message
    $('.flash-close').on('click', function () {
        $(this).parent().hide();
    });

    const csrfToken = $('#csrf_token').val();

    // When the "Send Code" button is clicked, send a verification code request
    $('#sendCodeButton').on('click', function (event) {
        event.preventDefault();

        const emailInput = $('#email').val().trim();
        if (!emailInput) {
            alert('Please enter your email before requesting a verification code.');
            return;
        }

        const formData = new FormData();
        formData.append('email', emailInput);

        // Disable the button and start the countdown
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

        // Send the verification code request to the backend
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

    // When the "Login" button is clicked, submit the form to the login path
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
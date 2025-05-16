$(function () {
    const $passwordInput = $('#new_password');
    const $passwordError = $('#new_passwordError');

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

    // Toggle password show/hide functionality
    function togglePasswordVisibility(inputId, toggleIconId) {
        const $input = $('#' + inputId);
        const $toggleIcon = $('#' + toggleIconId);

        $toggleIcon.on('click', function () {
            const isPassword = $input.attr('type') === 'password';
            $input.attr('type', isPassword ? 'text' : 'password');
            $toggleIcon.toggleClass('bi-eye bi-eye-slash');
        });
    }

    // Add toggle feature for each password input box
    togglePasswordVisibility('current_password', 'togglePassword');
    togglePasswordVisibility('new_password', 'toggleNewPassword');
    togglePasswordVisibility('confirm_new_password', 'toggleConfirmPassword');
});

window.addEventListener('unload', function() {
  // Send a beacon to the server when the page is unloaded
  navigator.sendBeacon('/auth/logout');
});
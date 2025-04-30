 document.getElementById('change-password-form').addEventListener('submit', function(event) {
            event.preventDefault();
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            // Simulate current password validation
            const correctCurrentPassword = 'CorrectPassword123!'; // Replace with actual validation logic
            if (currentPassword !== correctCurrentPassword) {
                alert('Please enter the correct current password.');
                return;
            }

            // Validate new password
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(newPassword)) {
                alert('New password must be at least 8 characters long, include a number, an uppercase letter, a lowercase letter, and a special character.');
                return;
            }

            // Validate confirm password
            if (newPassword !== confirmPassword) {
                alert('New password and confirm password do not match. Please try again.');
                return;
            }

            // Add submission logic here, such as sending a request to the server
            alert('Password changed successfully!');
        });
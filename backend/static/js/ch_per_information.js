 document.getElementById('user-info-form').addEventListener('submit', function(event) {
            // Prevent the default form submission
            event.preventDefault();

            // Custom validation messages
            const username = document.getElementById('username');
            const email = document.getElementById('email');
            const phone = document.getElementById('phone');
            const birthdate = document.getElementById('birthdate');
            const address = document.getElementById('address');
            const gender = document.getElementById('gender');

            // Example of existing usernames (this should ideally come from a database or API)
            const existingUsernames = ['user1', 'admin', 'testuser'];

            // Validate username
            if (!username.value.trim()) {
                alert('Please fill out all fields.');
                username.focus();
                return;
            } else if (username.value.length < 6) {
                alert('Username must be at least 6 characters long.');
                username.focus();
                return;
            } else if (existingUsernames.includes(username.value.trim())) {
                alert('This username is already taken.');
                username.focus();
                return;
            }

            // Validate email
            if (!email.value.trim()) {
                alert('Please fill out all fields.');
                email.focus();
                return;
            } else if (!email.value.includes('@')) {
                alert('Email must contain an @ character.');
                email.focus();
                return;
            }

            // Validate phone (optional, but must be numeric if provided)
            if (phone.value.trim() && !/^\+?\d{7,15}$/.test(phone.value)) {
                alert('Please enter a valid phone number.');
                phone.focus();
                return;
            }

            // Validate birthdate (optional, but must be a valid date if provided)
            if (birthdate.value.trim() && isNaN(Date.parse(birthdate.value))) {
                alert('Please select a valid birthdate.');
                birthdate.focus();
                return;
            }

            // Validate address
            if (!address.value.trim()) {
                alert('Please fill out all fields.');
                address.focus();
                return;
            }

            // Validate gender
            if (!gender.value.trim()) {
                alert('Please fill out all fields.');
                gender.focus();
                return;
            }

            // If all validations pass
            alert('Form submitted successfully!');
            // Optionally, you can submit the form here using AJAX or other methods
        });
// Wait for the DOM to be fully loaded before executing the code
document.addEventListener('DOMContentLoaded', function() {
  // Get form elements for login and registration
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  // Handle login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      // Get email and password from the form
      const email = this.querySelector('input[type="email"]').value;
      const password = this.querySelector('input[type="password"]').value;

      // TODO: Send login request to backend
      console.log('Login attempt:', { email, password });
      
      // Simulate successful login by redirecting to upload page
      window.location.href = 'upload.html';
    });
  }

  // Handle registration form submission
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      // Get user registration details from the form
      const username = this.querySelector('input[type="text"]').value;
      const email = this.querySelector('input[type="email"]').value;
      const password = this.querySelector('input[type="password"]').value;

      // TODO: Send registration request to backend
      console.log('Register attempt:', { username, email, password });
      
      // Simulate successful registration
      alert('Registration successful! Please login.');
      this.reset();
    });
  }

  // 打卡功能
  const checkInBtn = document.getElementById('checkInBtn');
  const checkInProgress = document.getElementById('checkInProgress');
  const streakDays = document.getElementById('streakDays');

  if (checkInBtn && checkInProgress && streakDays) {
    checkInBtn.addEventListener('click', function() {
      console.log('Check In button clicked');
      let progress = parseInt(checkInProgress.style.width);
      let days = parseInt(streakDays.innerText);

      if (progress >= 100) {
        alert('Already fully checked in for this cycle!');
        return;
      }

      progress += 10;
      days += 1;
      if (progress > 100) progress = 100;

      checkInProgress.style.width = progress + '%';
      streakDays.innerText = days;

      alert('Check-in successful!');
    });
  } else {
    console.error('Check-in elements not found:', {
      checkInBtn,
      checkInProgress,
      streakDays
    });
  }
});
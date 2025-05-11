// Wait for the DOM to be fully loaded before executing the code
document.addEventListener('DOMContentLoaded', function() {
  // Get form elements for login and registration
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  // Handle login form submission
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

  // Handle registration form submission
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

}); 

document.addEventListener('DOMContentLoaded', function() {
  // 使用事件委托绑定点击事件
  document.body.addEventListener('click', function(event) {
    if (event.target.classList.contains('flash-close')) {
      event.target.parentElement.style.display = 'none';
    }
  });
});
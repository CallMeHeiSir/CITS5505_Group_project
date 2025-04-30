// Initialize settings functionality when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Get form elements
  const profileForm = document.querySelector('.settings-form');
  const photoButton = profileForm.querySelector('.profile-upload button');
  const saveButton = profileForm.querySelector('button:last-child');
  const usernameInput = profileForm.querySelector('input[type="text"]');
  const emailInput = profileForm.querySelector('input[type="email"]');

  // Handle profile photo change
  photoButton.addEventListener('click', function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          profileForm.querySelector('.profile-img').src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    };

    input.click();
  });

  // Handle profile information save
  saveButton.addEventListener('click', function() {
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();

    if (!username || !email) {
      alert('Please fill in all required fields');
      return;
    }

    // TODO: Send update request to backend
    console.log('Save profile:', { username, email });

    // Simulate successful save
    alert('Profile updated successfully!');
  });

  // Handle preference changes
  document.querySelectorAll('.settings-form select').forEach(select => {
    select.addEventListener('change', function() {
      // TODO: Send update request to backend
      console.log('Preference changed:', { 
        name: this.previousElementSibling.textContent,
        value: this.value 
      });
    });
  });

  // Handle privacy settings changes
  document.querySelectorAll('.checkbox-label input').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      // TODO: Send update request to backend
      console.log('Privacy setting changed:', {
        setting: this.parentElement.textContent.trim(),
        enabled: this.checked
      });
    });
  });
}); 
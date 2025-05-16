document.addEventListener('DOMContentLoaded', function() {
  // Global variable to avoid redeclaration
  const profileForm = document.getElementById('profile-form');

  // Flash message close
  document.body.addEventListener('click', function(event) {
    if (event.target.classList.contains('flash-close')) {
      event.target.parentElement.style.display = 'none';
    }
  });

  // Click avatar to trigger file selection
  const profileAvatar = document.getElementById('profile-avatar');
  const avatarUpload = document.getElementById('avatar-upload');
  if (profileAvatar && avatarUpload && profileForm) {
    profileAvatar.addEventListener('click', function() {
      avatarUpload.click();
    });

    avatarUpload.addEventListener('change', function() {
      const formData = new FormData(profileForm);
      formData.set('avatar', this.files[0]); // Update avatar field
      // Explicitly add CSRF token
      formData.set('_csrf_token', document.querySelector('#profile-form input[name="_csrf_token"]').value);
    
      $.ajax({
        url: '/update_profile',
        method: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(response) {
          if (response.success) {
            console.log('Avatar updated successfully');
            window.location.reload();
          } else {
            alert('Failed to update avatar: ' + response.message);
          }
        },
        error: function(jqXHR) {
          console.error('Avatar update error:', jqXHR.status, jqXHR.responseText);
          alert('Error updating avatar: ' + (jqXHR.responseJSON?.message || 'Server error'));
        }
      });
    });
  }

  // Edit bio
  const bioText = document.getElementById('bioText');
  const editBioBtn = document.getElementById('editBioBtn');
  if (editBioBtn && bioText) {
    editBioBtn.addEventListener('click', function() {
      const newBio = prompt("Enter your new bio:");
      if (newBio) {
        bioText.innerText = `"${newBio}"`;
        const formData = new FormData();
        formData.append('bio', newBio);
        formData.append('_csrf_token', document.querySelector('#profile-form input[name="_csrf_token"]').value);
  
        $.ajax({
          url: '/update_bio',
          method: 'POST',
          data: formData,
          processData: false,
          contentType: false,
          success: function(response) {
            if (response.success) {
              console.log('Bio updated successfully');
            } else {
              alert('Failed to update bio: ' + response.message);
            }
          },
          error: function(jqXHR) {
            console.error('Bio update error:', jqXHR.status, jqXHR.responseText);
            alert('Error updating bio: ' + (jqXHR.responseJSON?.message || 'Server error'));
          }
        });
      }
    });
  }

  // Profile form submission
  if (profileForm) {
    profileForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const formData = new FormData(this);
      $.ajax({
        url: '/update_profile',
        method: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(response) {
          if (response.success) {
            console.log('Profile updated successfully');
            window.location.reload();
          } else {
            alert('Failed to update profile: ' + response.message);
          }
        },
        error: function(jqXHR) {
          console.error('Profile update error:', jqXHR.status, jqXHR.responseText);
          alert('Error updating profile: ' + (jqXHR.responseJSON?.message || 'Server error'));
        }
      });
    });
  }
});

window.addEventListener('unload', function() {
  // Use navigator.sendBeacon to ensure the request is sent
  navigator.sendBeacon('/auth/logout');
});
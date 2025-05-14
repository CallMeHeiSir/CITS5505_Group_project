document.addEventListener('DOMContentLoaded', function() {
  // 闪现消息关闭
  document.body.addEventListener('click', function(event) {
    if (event.target.classList.contains('flash-close')) {
      event.target.parentElement.style.display = 'none';
    }
  });

  // 编辑个性签名
  const bioText = document.getElementById('bioText');
  const editBioBtn = document.getElementById('editBioBtn');
  if (editBioBtn && bioText) {
    editBioBtn.addEventListener('click', function() {
      const newBio = prompt("Enter your new bio:");
      if (newBio) {
        bioText.innerText = `"${newBio}"`;
        $.ajax({
          url: '/update_bio',
          method: 'POST',
          data: {
            bio: newBio,
            _csrf_token: $('input[name="_csrf_token"]').val()
          },
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

  // 个人信息表单提交
  const profileForm = document.getElementById('profile-form');
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
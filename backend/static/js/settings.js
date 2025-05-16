document.addEventListener('DOMContentLoaded', function() {
  // 全局变量，避免重复声明
  const profileForm = document.getElementById('profile-form');

  // 闪现消息关闭
  document.body.addEventListener('click', function(event) {
    if (event.target.classList.contains('flash-close')) {
      event.target.parentElement.style.display = 'none';
    }
  });

  // 点击头像触发文件选择
  const profileAvatar = document.getElementById('profile-avatar');
  const avatarUpload = document.getElementById('avatar-upload');
  if (profileAvatar && avatarUpload && profileForm) {
    profileAvatar.addEventListener('click', function() {
      avatarUpload.click();
    });

        avatarUpload.addEventListener('change', function() {
      const formData = new FormData(profileForm);
      formData.set('avatar', this.files[0]); // 更新 avatar 字段
      // 显式添加CSRF token
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

    // 编辑个性签名
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

  // 个人信息表单提交
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
  // 用 navigator.sendBeacon 保证请求能发出
  navigator.sendBeacon('/auth/logout');
});
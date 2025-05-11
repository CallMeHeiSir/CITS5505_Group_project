document.addEventListener('DOMContentLoaded', function() {
  const bioText = document.getElementById('bioText');
  const editBioBtn = document.getElementById('editBioBtn');
  const profileAvatar = document.getElementById('profileAvatar');
  const avatarInput = document.getElementById('avatarInput');

  // 编辑个性签名
  editBioBtn.addEventListener('click', function() {
    const newBio = prompt("Enter your new bio:");
    if (newBio) {
      bioText.innerText = `"${newBio}"`;
      alert('Bio updated!');
    }
  });

  // 关闭闪现消息
  document.body.addEventListener('click', function(event) {
    if (event.target.classList.contains('flash-close')) {
      event.target.parentElement.style.display = 'none';
    }
  });

  // 点击头像触发文件选择
  profileAvatar.addEventListener('click', function() {
    avatarInput.click();
  });

  // 文件选择后自动上传
  avatarInput.addEventListener('change', function() {
    const file = avatarInput.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('avatar', file);

      fetch('/auth/update_avatar', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // 刷新页面以显示闪现消息并更新头像
          window.location.reload();
        } else {
          alert('Failed to update avatar: ' + data.message);
        }
      })
      .catch(error => {
        console.error('Error uploading avatar:', error);
        alert('Error uploading avatar.');
      });
    }
  });
});
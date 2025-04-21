document.addEventListener('DOMContentLoaded', function() {
  // 获取表单元素
  const profileForm = document.querySelector('.settings-form');
  const photoButton = profileForm.querySelector('.profile-upload button');
  const saveButton = profileForm.querySelector('button:last-child');
  const usernameInput = profileForm.querySelector('input[type="text"]');
  const emailInput = profileForm.querySelector('input[type="email"]');

  // 处理头像更改
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

  // 处理个人资料保存
  saveButton.addEventListener('click', function() {
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();

    if (!username || !email) {
      alert('Please fill in all required fields');
      return;
    }

    // TODO: 发送更新请求到后端
    console.log('Save profile:', { username, email });

    // 模拟保存成功
    alert('Profile updated successfully!');
  });

  // 处理偏好设置更改
  document.querySelectorAll('.settings-form select').forEach(select => {
    select.addEventListener('change', function() {
      // TODO: 发送更新请求到后端
      console.log('Preference changed:', { 
        name: this.previousElementSibling.textContent,
        value: this.value 
      });
    });
  });

  // 处理隐私设置更改
  document.querySelectorAll('.checkbox-label input').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      // TODO: 发送更新请求到后端
      console.log('Privacy setting changed:', {
        setting: this.parentElement.textContent.trim(),
        enabled: this.checked
      });
    });
  });
}); 
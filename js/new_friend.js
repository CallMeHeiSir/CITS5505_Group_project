// new_friend.js

document.addEventListener('DOMContentLoaded', function() {

  const addFriendForm = document.getElementById('addFriendForm');

  addFriendForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('friendName').value.trim();
    const email = document.getElementById('friendEmail').value.trim();

    if (!name || !email) {
      alert('Please fill in both name and email!');
      return;
    }

    // 假装发送请求成功
    alert(`Friend request sent to ${name} (${email}) successfully!`);

    // 清空表单
    addFriendForm.reset();
  });

});

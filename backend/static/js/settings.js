document.addEventListener('DOMContentLoaded', function() {
  const bioText = document.getElementById('bioText');
  const editBioBtn = document.getElementById('editBioBtn');

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
});
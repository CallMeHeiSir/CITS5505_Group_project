// new_challenge.js

document.addEventListener('DOMContentLoaded', function() {

  const newChallengeForm = document.getElementById('newChallengeForm');

  newChallengeForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const title = document.getElementById('challengeTitle').value.trim();
    const description = document.getElementById('challengeDescription').value.trim();
    const category = document.getElementById('challengeCategory').value;

    if (!title || !description || !category) {
      alert('Please fill in all fields!');
      return;
    }

    // 假装提交成功（真实情况应该POST到后端）
    alert(`Challenge created!\nTitle: ${title}\nCategory: ${category}`);

    // 重置表单
    newChallengeForm.reset();
  });

});

// new_issue.js

document.addEventListener('DOMContentLoaded', function() {

  const newIssueForm = document.getElementById('newIssueForm');

  newIssueForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const title = document.getElementById('issueTitle').value.trim();
    const description = document.getElementById('issueDescription').value.trim();
    const category = document.getElementById('issueCategory').value;

    if (!title || !description || !category) {
      alert('Please fill in all fields!');
      return;
    }

    // 假装成功发布
    alert('Your question has been posted successfully!');

    // 发布后跳转回 issue 列表页（假设有 issue.html）
    window.location.href = "issue.html";
  });

});

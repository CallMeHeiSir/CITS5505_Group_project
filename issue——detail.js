// issue_detail.js

document.addEventListener('DOMContentLoaded', function() {

  // 假数据：已有回答
  const answers = [
    { content: "Set small daily goals. Even 1km is better than nothing!", likes: 3 },
    { content: "Join a local running group. Running with friends keeps you motivated!", likes: 5 }
  ];

  const answersContainer = document.getElementById('answersContainer');
  const answerForm = document.getElementById('answerForm');
  const answerInput = document.getElementById('answerInput');

  // 渲染回答列表
  function renderAnswers() {
    answersContainer.innerHTML = '';

    answers.forEach((answer, index) => {
      const div = document.createElement('div');
      div.className = 'forum-post';
      div.innerHTML = `
        <p class="post-content">${answer.content}</p>
        <div class="post-actions">
          <button class="btn-text like-btn" data-index="${index}">
            <i class="bi bi-heart"></i> <span id="likes-${index}">${answer.likes}</span>
          </button>
        </div>
      `;
      answersContainer.appendChild(div);
    });

    // 给所有点赞按钮绑定事件
    document.querySelectorAll('.like-btn').forEach(button => {
      button.addEventListener('click', function() {
        const index = this.getAttribute('data-index');
        likeAnswer(index);
      });
    });
  }

  // 点赞功能
  function likeAnswer(index) {
    answers[index].likes++;
    document.getElementById(`likes-${index}`).innerText = answers[index].likes;
  }

  // 提交新回答
  answerForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const content = answerInput.value.trim();
    if (content) {
      answers.push({ content, likes: 0 });
      renderAnswers();
      answerInput.value = '';
      alert('Answer submitted successfully!');
    }
  });

  // 初始化页面
  renderAnswers();

});

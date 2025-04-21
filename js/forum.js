document.addEventListener('DOMContentLoaded', function() {
  // 获取表单元素
  const postForm = document.querySelector('.forum-post-form');
  const titleInput = postForm.querySelector('input[type="text"]');
  const contentTextarea = postForm.querySelector('textarea');
  const postButton = postForm.querySelector('button');

  // 处理发帖
  postButton.addEventListener('click', function() {
    const title = titleInput.value.trim();
    const content = contentTextarea.value.trim();

    if (!title || !content) {
      alert('Please fill in both title and content');
      return;
    }

    // TODO: 发送创建帖子请求到后端
    console.log('Create post:', { title, content });

    // 模拟发帖成功
    const postElement = createPostElement({
      title,
      content,
      author: 'You',
      time: 'Just now',
      likes: 0,
      comments: 0
    });

    // 添加到帖子列表的开头
    const postsContainer = document.querySelector('.forum-posts');
    postsContainer.insertBefore(postElement, postsContainer.firstChild);

    // 清空表单
    titleInput.value = '';
    contentTextarea.value = '';
  });

  // 处理帖子互动（点赞、评论、分享）
  document.querySelectorAll('.post-actions').forEach(actions => {
    actions.addEventListener('click', function(e) {
      const button = e.target.closest('button');
      if (!button) return;

      if (button.querySelector('.bi-heart')) {
        const likesCount = button.textContent.trim();
        button.innerHTML = `<i class="bi bi-heart-fill"></i> ${parseInt(likesCount) + 1}`;
      }
    });
  });

  // 创建帖子元素的辅助函数
  function createPostElement(post) {
    const div = document.createElement('div');
    div.className = 'forum-post';
    div.innerHTML = `
      <div class="post-header">
        <span class="post-title">${post.title}</span>
        <small class="text-muted">Posted by ${post.author} • ${post.time}</small>
      </div>
      <p class="post-content">${post.content}</p>
      <div class="post-actions">
        <button class="btn-text"><i class="bi bi-heart"></i> ${post.likes}</button>
        <button class="btn-text"><i class="bi bi-chat"></i> ${post.comments}</button>
        <button class="btn-text"><i class="bi bi-share"></i></button>
      </div>
    `;
    return div;
  }
}); 
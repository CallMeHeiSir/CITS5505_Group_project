document.addEventListener('DOMContentLoaded', function () {
  const postForm = document.getElementById('postForm');
  const postsContainer = document.getElementById('postsContainer');
  const categoryFilter = document.getElementById('categoryFilter');
  const pagination = document.getElementById('pagination');

  let posts = JSON.parse(localStorage.getItem('forumPosts')) || [];
  const POSTS_PER_PAGE = 5;
  let currentPage = 1;

  // 辅助函数：保存帖子到localStorage
  function savePosts() {
    localStorage.setItem('forumPosts', JSON.stringify(posts));
  }

  // 辅助函数：创建单个帖子元素
  function createPostElement(post) {
    const div = document.createElement('div');
    div.className = 'forum-post';
    div.innerHTML = `
      <div class="post-header">
        <h3 class="post-title">${post.title}</h3>
        <small class="text-muted">Posted by ${post.author} • ${post.time}</small>
      </div>
      <p class="post-content">${post.content}</p>
      <div class="post-actions">
        <button class="btn-text like-button"><i class="bi bi-heart"></i> <span>${post.likes}</span></button>
        <button class="btn-text comment-button"><i class="bi bi-chat"></i> ${post.comments}</button>
        <button class="btn-text share-button"><i class="bi bi-share"></i></button>
      </div>
    `;
    return div;
  }

  // 渲染帖子列表
  function renderPosts() {
    postsContainer.innerHTML = '';
    const filteredPosts = getFilteredPosts();
    const paginatedPosts = filteredPosts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

    if (paginatedPosts.length === 0) {
      postsContainer.innerHTML = '<p style="text-align:center;">No posts yet.</p>';
    } else {
      paginatedPosts.forEach(post => {
        const postElement = createPostElement(post);
        postsContainer.appendChild(postElement);
      });
    }

    renderPagination(filteredPosts.length);
  }

  // 渲染分页按钮
  function renderPagination(totalPosts) {
    pagination.innerHTML = '';
    const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.textContent = i;
      btn.className = 'btn-gradient';
      btn.style.margin = '5px';
      if (i === currentPage) {
        btn.style.opacity = '0.7';
      }
      btn.addEventListener('click', () => {
        currentPage = i;
        renderPosts();
      });
      pagination.appendChild(btn);
    }
  }

  // 获取当前筛选分类的帖子
  function getFilteredPosts() {
    const selectedCategory = categoryFilter.value;
    if (selectedCategory === 'All') {
      return posts;
    }
    return posts.filter(post => post.category === selectedCategory);
  }

  // 提交发帖表单
  postForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const title = document.getElementById('postTitle').value.trim();
    const content = document.getElementById('postContent').value.trim();
    const category = document.getElementById('postCategory').value;

    if (!title || !content) {
      alert('Please fill in both title and content!');
      return;
    }

    const newPost = {
      title,
      content,
      category,
      author: 'You',
      time: 'Just now',
      likes: 0,
      comments: 0
    };

    posts.unshift(newPost);
    savePosts();
    currentPage = 1;
    renderPosts();

    // 清空表单
    postForm.reset();
  });

  // 点赞、评论、分享按钮监听（事件委托）
  postsContainer.addEventListener('click', function (e) {
    const likeBtn = e.target.closest('.like-button');
    const commentBtn = e.target.closest('.comment-button');
    const shareBtn = e.target.closest('.share-button');

    if (likeBtn) {
      const likeCount = likeBtn.querySelector('span');
      likeCount.textContent = parseInt(likeCount.textContent) + 1;
    }

    if (commentBtn) {
      alert('Comment feature coming soon!');
    }

    if (shareBtn) {
      alert('Share feature coming soon!');
    }
  });

  // 筛选分类变化
  categoryFilter.addEventListener('change', function () {
    currentPage = 1;
    renderPosts();
  });

  // 页面首次渲染
  renderPosts();
});

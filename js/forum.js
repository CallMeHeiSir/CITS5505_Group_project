// Initialize forum functionality when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Get form elements
  const postForm = document.querySelector('.forum-post-form');
  const titleInput = postForm.querySelector('input[type="text"]');
  const contentTextarea = postForm.querySelector('textarea');
  const postButton = postForm.querySelector('button');

  // Handle post creation
  postButton.addEventListener('click', function() {
    const title = titleInput.value.trim();
    const content = contentTextarea.value.trim();

    if (!title || !content) {
      alert('Please fill in both title and content');
      return;
    }

    // TODO: Send create post request to backend
    console.log('Create post:', { title, content });

    // Simulate successful post creation
    const postElement = createPostElement({
      title,
      content,
      author: 'You',
      time: 'Just now',
      likes: 0,
      comments: 0
    });

    // Add the new post to the beginning of the posts list
    const postsContainer = document.querySelector('.forum-posts');
    postsContainer.insertBefore(postElement, postsContainer.firstChild);

    // Clear the form
    titleInput.value = '';
    contentTextarea.value = '';
  });

  // Handle post interactions (likes, comments, shares)
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

  // Helper function to create a post element
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
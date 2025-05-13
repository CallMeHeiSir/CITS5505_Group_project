// new_friend.js

document.addEventListener('DOMContentLoaded', function() {
  const addFriendForm = document.getElementById('addFriendForm');
  const searchInput = document.getElementById('friendSearch');
  const searchResults = document.getElementById('searchResults');
  const API = {
    SEARCH: '/api/friends/search',
    REQUEST: '/api/friends/request'
  };

  // 搜索用户
  let searchTimeout;
  searchInput.addEventListener('input', function() {
    clearTimeout(searchTimeout);
    const query = this.value.trim();
    
    if (query.length < 2) {
      searchResults.innerHTML = '';
      return;
    }
    
    searchTimeout = setTimeout(async () => {
      try {
        const response = await fetch(`${API.SEARCH}?query=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.error || 'Failed to search users');
        
        // 显示搜索结果
        searchResults.innerHTML = '';
        if (!data.users || data.users.length === 0) {
          searchResults.innerHTML = '<div class="no-results">No users found</div>';
          return;
        }
        
        data.users.forEach(user => {
          const div = document.createElement('div');
          div.className = 'user-item';
          
          let actionButton = '';
          if (user.friendship_status === 'pending') {
            actionButton = '<button class="btn-text" disabled>Request Pending</button>';
          } else if (user.friendship_status === 'accepted') {
            actionButton = '<button class="btn-text" disabled>Already Friends</button>';
          } else {
            actionButton = `<button class="btn-text add-friend" data-id="${user.id}">Add Friend</button>`;
          }
          
          div.innerHTML = `
            <div class="user-info">
              <div class="username">${user.username}</div>
              <div class="email">${user.email}</div>
            </div>
            <div class="user-actions">
              ${actionButton}
            </div>
          `;
          searchResults.appendChild(div);
        });
        
        // 绑定添加好友按钮事件
        document.querySelectorAll('.add-friend').forEach(button => {
          button.addEventListener('click', async function() {
            const userId = this.dataset.id;
            try {
              const response = await fetch(API.REQUEST, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  friendId: userId
                })
              });
              const data = await response.json();
              
              if (!response.ok) throw new Error(data.error || 'Failed to send friend request');
              
              showSuccess('Friend request sent successfully');
              this.disabled = true;
              this.textContent = 'Request Sent';
            } catch (error) {
              console.error('Error sending friend request:', error);
              showError('Failed to send friend request. Please try again later.');
            }
          });
        });
      } catch (error) {
        console.error('Error searching users:', error);
        showError('Failed to search users. Please try again later.');
      }
    }, 300);
  });

  // 显示成功消息
  function showSuccess(message) {
    alert(message); // 可以改用更好的通知组件
  }

  // 显示错误消息
  function showError(message) {
    alert(message); // 可以改用更好的通知组件
  }
});

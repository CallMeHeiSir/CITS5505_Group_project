// friends.js

document.addEventListener('DOMContentLoaded', function() {
  const friendsContainer = document.getElementById('friendsContainer');
  const API = {
    FRIENDS: '/api/friends',
    PENDING: '/api/friends/pending',
    SEARCH: '/api/friends/search',
    REQUEST: '/api/friends/request'
  };

  // 加载好友列表
  async function loadFriends() {
    try {
      const response = await fetch(API.FRIENDS);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to load friends');

      friendsContainer.innerHTML = '';

      if (!data.friends || data.friends.length === 0) {
        friendsContainer.innerHTML = `
          <div class="no-friends">
            <p>You don't have any friends yet. Start by adding some friends!</p>
            <a href="/new_friend" class="btn-gradient">Add Friends</a>
          </div>
        `;
        return;
      }

      data.friends.forEach(friend => {
        const div = document.createElement('div');
        div.className = 'forum-post challenge-card';

        div.innerHTML = `
          <div class="post-header">
            <h3 class="post-title">${friend.username}</h3>
            <span class="friend-email">${friend.email}</span>
          </div>

          <div class="post-actions">
            <button class="btn-text share-btn" data-id="${friend.id}">
              <i class="bi bi-share"></i> Share Activity
            </button>
            <button class="btn-text remove-btn" data-id="${friend.friendship_id}">
              <i class="bi bi-person-x"></i> Remove Friend
            </button>
          </div>
        `;
        friendsContainer.appendChild(div);
      });

      // 绑定按钮事件
      bindButtonEvents();
    } catch (error) {
      console.error('Error loading friends:', error);
      showError('Failed to load friends list. Please try again later.');
    }
  }

  // 加载待处理的好友请求
  async function loadPendingRequests() {
    try {
      const response = await fetch(API.PENDING);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to load pending requests');

      // 创建待处理请求区域
      const pendingSection = document.createElement('section');
      pendingSection.className = 'pending-requests';
      pendingSection.innerHTML = '<h2>Pending Requests</h2>';

      // 处理收到的请求
      if (data.received && data.received.length > 0) {
        const receivedDiv = document.createElement('div');
        receivedDiv.className = 'received-requests';
        receivedDiv.innerHTML = '<h3>Received Requests</h3>';

        data.received.forEach(request => {
          const requestDiv = document.createElement('div');
          requestDiv.className = 'request-item';
          requestDiv.innerHTML = `
            <div class="request-info">
              <span class="username">${request.friend.username}</span>
              <span class="email">${request.friend.email}</span>
            </div>
            <div class="request-actions">
              <button class="btn-text accept-btn" data-id="${request.id}">Accept</button>
              <button class="btn-text reject-btn" data-id="${request.id}">Reject</button>
            </div>
          `;
          receivedDiv.appendChild(requestDiv);
        });
        pendingSection.appendChild(receivedDiv);
      }

      // 处理发送的请求
      if (data.sent && data.sent.length > 0) {
        const sentDiv = document.createElement('div');
        sentDiv.className = 'sent-requests';
        sentDiv.innerHTML = '<h3>Sent Requests</h3>';

        data.sent.forEach(request => {
          const requestDiv = document.createElement('div');
          requestDiv.className = 'request-item';
          requestDiv.innerHTML = `
            <div class="request-info">
              <span class="username">${request.friend.username}</span>
              <span class="email">${request.friend.email}</span>
              <span class="status">Pending</span>
            </div>
          `;
          sentDiv.appendChild(requestDiv);
        });
        pendingSection.appendChild(sentDiv);
      }

      // 如果有待处理的请求，添加到页面
      if (data.received.length > 0 || data.sent.length > 0) {
        const mainContent = document.querySelector('.main-content .card');
        mainContent.insertBefore(pendingSection, mainContent.firstChild);
      }
    } catch (error) {
      console.error('Error loading pending requests:', error);
      showError('Failed to load pending requests. Please try again later.');
    }
  }

  // 绑定按钮事件
  function bindButtonEvents() {
    // 删除好友
    document.querySelectorAll('.remove-btn').forEach(button => {
      button.addEventListener('click', async function() {
        const friendshipId = this.dataset.id;
        if (confirm('Are you sure you want to remove this friend?')) {
          try {
            const response = await fetch(`${API.FRIENDS}/${friendshipId}`, {
              method: 'DELETE'
            });
            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Failed to remove friend');

            showSuccess('Friend removed successfully');
            loadFriends();  // 重新加载好友列表
          } catch (error) {
            console.error('Error removing friend:', error);
            showError('Failed to remove friend. Please try again later.');
          }
        }
      });
    });

    // 处理好友请求
    document.querySelectorAll('.accept-btn, .reject-btn').forEach(button => {
      button.addEventListener('click', async function() {
        const requestId = this.dataset.id;
        const action = this.classList.contains('accept-btn') ? 'accept' : 'reject';

        try {
          const response = await fetch(`${API.REQUEST}/${requestId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action })
          });
          const data = await response.json();

          if (!response.ok) throw new Error(data.error || `Failed to ${action} request`);

          showSuccess(`Friend request ${action}ed successfully`);
          loadPendingRequests();  // 重新加载待处理请求
          if (action === 'accept') loadFriends();  // 如果接受了请求，重新加载好友列表
        } catch (error) {
          console.error(`Error ${action}ing request:`, error);
          showError(`Failed to ${action} request. Please try again later.`);
        }
      });
    });
  }

  // 显示成功消息
  function showSuccess(message) {
    alert(message); // 可以改用更好的通知组件
  }

  // 显示错误消息
  function showError(message) {
    alert(message); // 可以改用更好的通知组件
  }

  // 初始加载
  loadFriends();
  loadPendingRequests();
});

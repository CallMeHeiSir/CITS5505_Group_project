// 通用分享弹窗逻辑
window.openShareModal = function(shareOptions) {
  // shareOptions: { type: 'activity'|'chart'|'dashboard', id: 活动id/图表类型/等 }
  const modal = document.getElementById('share-modal');
  const closeBtn = document.getElementById('share-modal-close');
  const friendSelect = document.getElementById('share-friend-select');
  const messageInput = document.getElementById('share-message');
  const confirmBtn = document.getElementById('share-modal-confirm');
  const statusDiv = document.getElementById('share-modal-status');

  // 清空状态
  friendSelect.innerHTML = '<option value="">Loading...</option>';
  messageInput.value = '';
  statusDiv.textContent = '';
  modal.style.display = 'flex';

  // 拉取好友列表
  fetch('/api/share/friends')
    .then(res => res.json())
    .then(data => {
      friendSelect.innerHTML = '';
      if (data.friends && data.friends.length > 0) {
        data.friends.forEach(f => {
          const opt = document.createElement('option');
          opt.value = f.id;
          opt.textContent = f.username;
          friendSelect.appendChild(opt);
        });
      } else {
        friendSelect.innerHTML = '<option value="">No friends found</option>';
      }
    })
    .catch(() => {
      friendSelect.innerHTML = '<option value="">Failed to load friends</option>';
    });

  // 关闭弹窗
  closeBtn.onclick = () => { modal.style.display = 'none'; };
  window.onclick = e => { if (e.target === modal) modal.style.display = 'none'; };

  // 分享按钮
  confirmBtn.onclick = () => {
    const friendId = friendSelect.value;
    const message = messageInput.value;
    if (!friendId) {
      statusDiv.textContent = 'Please select a friend.';
      return;
    }
    statusDiv.textContent = 'Sharing...';
    let url = '/api/share/activity';
    let body = {
      share_to_user_id: friendId,
      share_message: message
    };
    if (shareOptions.type === 'activity') {
      body.activity_id = shareOptions.id;
    } else if (shareOptions.type === 'chart') {
      body.visualization_type = shareOptions.id;
    } else if (shareOptions.type === 'dashboard') {
      body.visualization_type = 'dashboard';
    }
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success || data.message === 'Activity shared successfully') {
          statusDiv.style.color = '#388e3c';
          statusDiv.textContent = 'Share successful!';
          setTimeout(() => { modal.style.display = 'none'; }, 1200);
        } else {
          statusDiv.style.color = '#d32f2f';
          statusDiv.textContent = data.message || 'Share failed.';
        }
      })
      .catch(() => {
        statusDiv.style.color = '#d32f2f';
        statusDiv.textContent = 'Share failed.';
      });
  };
};
// 供所有页面调用 window.openShareModal({type, id}) 
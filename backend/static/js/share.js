// Initialize sharing functionality when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Get sharing form elements
  const shareButton = document.getElementById('share-analysis');
  const textarea = document.getElementById('share-text');
  const chartSelect = document.getElementById('chart-select');
  const friendSelect = document.getElementById('friend-select');

  // Initialize toggle buttons
  const toggleButtons = document.querySelectorAll('.toggle-btn');
  toggleButtons.forEach(button => {
    button.addEventListener('click', function() {
      const content = this.closest('.share-section').querySelector('.share-content');
      content.classList.toggle('collapsed');
      this.querySelector('i').style.transform = content.classList.contains('collapsed') ? 'rotate(-180deg)' : '';
    });
  });

  // Load existing shares from localStorage
  updateSentShares();

  // Handle share button click
  shareButton.addEventListener('click', handleShare);
});

function handleShare() {
  const textarea = document.getElementById('share-text');
  const chartSelect = document.getElementById('chart-select');
  const friendSelect = document.getElementById('friend-select');
  const shareButton = document.getElementById('share-analysis');
  
  const content = textarea.value.trim();
  const selectedChart = chartSelect.value;
  const selectedFriend = friendSelect.value;

  // Validate inputs
  if (!content) {
    alert('Please write your thoughts about the chart.');
    textarea.focus();
    return;
  }

  if (!selectedChart) {
    alert('Please select a chart to share.');
    chartSelect.focus();
    return;
  }

  if (!selectedFriend) {
    alert('Please select a friend to share with.');
    friendSelect.focus();
    return;
  }

  // Add sharing animation
  shareButton.style.opacity = '0.7';
  shareButton.textContent = 'Sharing...';
  shareButton.disabled = true;

  // Create new share record
  const shareRecord = {
    id: Date.now(), // 用时间戳作为唯一ID
    content: content,
    chartName: chartSelect.options[chartSelect.selectedIndex].text,
    friendName: friendSelect.options[friendSelect.selectedIndex].text,
    timestamp: new Date().toISOString()
  };

  // Simulate network delay (in real app this would be an API call)
  setTimeout(() => {
    // Add to localStorage
    const sentShares = JSON.parse(localStorage.getItem('sentShares') || '[]');
    sentShares.unshift(shareRecord); // Add new share to the beginning
    localStorage.setItem('sentShares', JSON.stringify(sentShares));

    // Update UI
    updateSentShares();

    // Reset form
    textarea.value = '';
    chartSelect.value = '';
    friendSelect.value = '';

    // Reset button
    shareButton.style.opacity = '1';
    shareButton.textContent = 'Share Analysis';
    shareButton.disabled = false;

    // Show success message
    alert('Successfully shared!');
  }, 1000);
}

function updateSentShares() {
  const sentShares = JSON.parse(localStorage.getItem('sentShares') || '[]');
  const container = document.querySelector('.share-section:last-child .share-content');
  
  if (sentShares.length === 0) {
    container.innerHTML = '<div class="empty-state">No shares sent yet.</div>';
    return;
  }

  const sharesHTML = sentShares.map(share => `
    <div class="share-record">
      <div class="record-header">
        <div class="record-title">
          <h3>${share.chartName}</h3>
          <span class="share-info">Shared with ${share.friendName} • ${formatDate(share.timestamp)}</span>
        </div>
      </div>
      <div class="record-content">
        <p>${share.content}</p>
      </div>
      <div class="record-actions">
        <button class="action-btn view-btn" onclick="viewChart('${share.chartName}')">
          <i class="bi bi-graph-up"></i>
          View Chart
        </button>
        <button class="action-btn withdraw-btn" onclick="withdrawShare(${share.id})">
          <i class="bi bi-x-lg"></i>
          Withdraw
        </button>
      </div>
    </div>
  `).join('');

  container.innerHTML = sharesHTML;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ', ' + date.toLocaleTimeString();
}

function viewChart(chartName) {
  alert('Viewing chart: ' + chartName);
  // 这里可以添加查看图表的具体实现
}

function withdrawShare(shareId) {
  if (confirm('Are you sure you want to withdraw this share?')) {
    let sentShares = JSON.parse(localStorage.getItem('sentShares') || '[]');
    sentShares = sentShares.filter(share => share.id !== shareId);
    localStorage.setItem('sentShares', JSON.stringify(sentShares));
    updateSentShares();
    alert('Share withdrawn successfully.');
  }
}

// 创建新分享
function createNewShare() {
  const content = document.querySelector('.ql-editor').innerHTML;
  const charts = $('#chart-select').val();
  const friends = $('#friend-select').val();

  if (!content.trim() || !charts.length || !friends.length) {
    alert('请填写完整的分享信息！');
    return;
  }

  const shareRecord = {
    content: content,
    charts: charts,
    friends: friends,
    timestamp: new Date().toISOString(),
    author: {
      name: 'Current User',
      avatar: '/static/avatars/default.png'
    }
  };

  const myShares = JSON.parse(localStorage.getItem('myShares') || '[]');
  myShares.push(shareRecord);
  localStorage.setItem('myShares', JSON.stringify(myShares));

  // 清空表单
  document.querySelector('.ql-editor').innerHTML = '';
  $('#chart-select').val(null).trigger('change');
  $('#friend-select').val(null).trigger('change');

  // 切换到发出的分享标签页
  document.querySelector('[data-tab="my-shares"]').click();
  
  // 显示成功消息
  alert('分享发布成功！');
}

// 加载收到的分享
function loadReceivedShares() {
  const receivedList = document.getElementById('received-shares-list');
  // 模拟数据
  const receivedShares = [
    {
      id: 1,
      author: {
        name: 'John Doe',
        avatar: '/static/avatars/default.png'
      },
      content: '<p>这是我最近的跑步数据，希望对你有帮助！</p>',
      charts: ['跑步数据', '心率数据'],
      timestamp: '2024-03-20T10:00:00Z',
      isRead: false,
      replies: []
    },
    {
      id: 2,
      author: {
        name: 'Jane Smith',
        avatar: '/static/avatars/default.png'
      },
      content: '<p>分享一下我的健身计划和饮食记录。</p>',
      charts: ['健身记录', '饮食计划'],
      timestamp: '2024-03-19T15:30:00Z',
      isRead: true,
      replies: [
        {
          author: 'Current User',
          content: '谢谢分享！这个计划很有参考价值。',
          timestamp: '2024-03-19T16:00:00Z'
        }
      ]
    }
  ];

  receivedList.innerHTML = receivedShares.map(share => createShareRecordHTML(share, 'received')).join('');
  initializeReplyForms();
}

// 加载发出的分享
function loadMyShares() {
  const mySharesList = document.getElementById('my-shares-list');
  const myShares = JSON.parse(localStorage.getItem('myShares') || '[]');

  mySharesList.innerHTML = myShares.map(share => createShareRecordHTML(share, 'sent')).join('');
  initializeReplyForms();
}

// 创建分享记录 HTML
function createShareRecordHTML(share, type) {
  const isReceived = type === 'received';
  const statusBadge = isReceived ? `
    <div class="status-badge ${share.isRead ? 'status-read' : 'status-unread'}">
      ${share.isRead ? '已读' : '未读'}
    </div>
  ` : '';

  const actions = isReceived ? `
    <button class="action-btn btn-reply" onclick="toggleReplyForm(${share.id})">
      <i class="bi bi-reply-fill"></i>回复
    </button>
  ` : `
    <button class="action-btn btn-revoke" onclick="revokeShare('${share.timestamp}')">
      <i class="bi bi-trash-fill"></i>撤回
    </button>
  `;

  const replies = share.replies ? share.replies.map(reply => `
    <div class="reply-item">
      <div class="reply-author">${reply.author}</div>
      <div class="reply-content">${reply.content}</div>
      <div class="reply-time">${new Date(reply.timestamp).toLocaleString()}</div>
    </div>
  `).join('') : '';

  return `
    <div class="record-item" data-id="${share.id || share.timestamp}">
      <div class="record-header">
        <div class="record-author">
          <img src="${share.author.avatar}" alt="${share.author.name}" class="author-avatar">
          <div class="author-info">
            <span class="author-name">${share.author.name}</span>
            <span class="post-time">${new Date(share.timestamp).toLocaleString()}</span>
          </div>
        </div>
        ${statusBadge}
      </div>
      <div class="record-content">${share.content}</div>
      <div class="shared-charts">
        ${share.charts.map(chart => `
          <span class="chart-badge">
            <i class="bi bi-graph-up"></i>${chart}
          </span>
        `).join('')}
      </div>
      <div class="record-actions">
        ${actions}
      </div>
      <div class="replies-section">
        ${replies}
      </div>
      ${isReceived ? `
        <div class="reply-form" id="reply-form-${share.id}">
          <textarea class="reply-input" placeholder="写下你的回复..."></textarea>
          <div class="reply-actions">
            <button class="btn-gradient" onclick="submitReply(${share.id})">发送回复</button>
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

// 初始化回复表单
function initializeReplyForms() {
  document.querySelectorAll('.reply-form').forEach(form => {
    form.style.display = 'none';
  });
}

// 切换回复表单显示状态
function toggleReplyForm(shareId) {
  const form = document.getElementById(`reply-form-${shareId}`);
  const isVisible = form.style.display === 'block';
  form.style.display = isVisible ? 'none' : 'block';
  if (!isVisible) {
    form.querySelector('textarea').focus();
  }
}

// 提交回复
function submitReply(shareId) {
  const form = document.getElementById(`reply-form-${shareId}`);
  const content = form.querySelector('textarea').value.trim();

  if (!content) {
    alert('请输入回复内容！');
    return;
  }

  // TODO: 发送回复到后端
  alert('回复已发送！');
  form.querySelector('textarea').value = '';
  form.style.display = 'none';
}

// 撤回分享
function revokeShare(timestamp) {
  if (!confirm('确定要撤回这条分享吗？')) {
    return;
  }

  const myShares = JSON.parse(localStorage.getItem('myShares') || '[]');
  const index = myShares.findIndex(share => share.timestamp === timestamp);
  if (index !== -1) {
    myShares.splice(index, 1);
    localStorage.setItem('myShares', JSON.stringify(myShares));
    loadMyShares();
  }
} 
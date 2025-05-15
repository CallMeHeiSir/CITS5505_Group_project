// Initialize sharing functionality when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Get sharing form elements
  const shareButton = document.getElementById('share-analysis');
  const textarea = document.getElementById('share-text');
  const chartSelect = document.getElementById('chart-select');
  const friendSelect = document.getElementById('friend-select');

  // Load friends list
  loadFriendsList();

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

  loadReceivedShares();
  loadSentShares();
});

// Load friends list from backend
function loadFriendsList() {
  fetch('/api/friend/friends')
    .then(response => response.json())
    .then(data => {
      if (data.friends) {
        const friendSelect = document.getElementById('friend-select');
        // Clear existing options except the placeholder
        while (friendSelect.options.length > 1) {
          friendSelect.remove(1);
        }
        // Add friend options
        data.friends.forEach(friend => {
          const option = document.createElement('option');
          option.value = friend.id;
          option.textContent = friend.username;
          friendSelect.appendChild(option);
        });
      }
    })
    .catch(error => {
      console.error('Error loading friends list:', error);
      alert('Failed to load friends list. Please try again later.');
    });
}

function handleShare() {
  const textarea = document.getElementById('share-text');
  const chartSelect = document.getElementById('chart-select');
  const friendSelect = document.getElementById('friend-select');
  const shareButton = document.getElementById('share-analysis');
  
  const content = textarea.value.trim();
  const selectedChart = chartSelect.value;
  const selectedFriendId = friendSelect.value;
  const selectedFriendName = friendSelect.options[friendSelect.selectedIndex].text;

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

  if (!selectedFriendId) {
    alert('Please select a friend to share with.');
    friendSelect.focus();
    return;
  }

  // Add sharing animation
  shareButton.style.opacity = '0.7';
  shareButton.textContent = 'Sharing...';
  shareButton.disabled = true;

  // Send share request to backend
  fetch('/api/share/activity', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      activity_id: selectedChart,
      share_to_user_id: selectedFriendId,
      message: content,
      visualization_type: selectedChart
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.status === 'success') {
      // Create new share record for UI
      const shareRecord = {
        id: Date.now(),
        content: content,
        chartName: chartSelect.options[chartSelect.selectedIndex].text,
        friendName: selectedFriendName,
        timestamp: new Date().toISOString()
      };

      // Add to localStorage
      const sentShares = JSON.parse(localStorage.getItem('sentShares') || '[]');
      sentShares.unshift(shareRecord);
      localStorage.setItem('sentShares', JSON.stringify(sentShares));

      // Update UI
      updateSentShares();

      // Reset form
      textarea.value = '';
      chartSelect.value = '';
      friendSelect.value = '';

      // Show success message
      alert('Successfully shared!');
    } else {
      alert(data.message || 'Failed to share. Please try again.');
    }
  })
  .catch(error => {
    console.error('Error sharing:', error);
    alert('Failed to share. Please try again later.');
  })
  .finally(() => {
    // Reset button
    shareButton.style.opacity = '1';
    shareButton.textContent = 'Share Analysis';
    shareButton.disabled = false;
  });
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
  fetch('/api/share/received')
    .then(res => res.json())
    .then(data => {
      const container = document.querySelector('.share-section:nth-of-type(2) .share-content');
      if (!container) return;
      container.innerHTML = '';
      if (!data.shared_activities || data.shared_activities.length === 0) {
        container.innerHTML = '<div class="empty-state">No shares received yet.</div>';
        return;
      }
      data.shared_activities.forEach(share => {
        container.appendChild(renderShareMessage(share, 'received'));
      });
    });
}

// 加载发出的分享
function loadSentShares() {
  fetch('/api/share/sent')
    .then(res => res.json())
    .then(data => {
      const container = document.querySelector('.share-section:last-child .share-content');
      container.innerHTML = '';
      if (!data.sent_activities || data.sent_activities.length === 0) {
        container.innerHTML = '<div class="empty-state">No shares sent yet.</div>';
        return;
      }
      data.sent_activities.forEach(share => {
        container.appendChild(renderShareMessage(share, 'sent'));
      });
    });
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

function renderShareMessage(share, type) {
  // 头像、用户名、时间
  const user = type === 'received' ? share.shared_from : share.shared_to;
  // 格式化UTC时间：日期和时间之间用空格，只保留到秒
  let time = share.created_at;
  if (time) {
    time = time.replace('T', ' ');
    time = time.replace(/\.[0-9]+/, '');
  }
  time = time + ' (UTC)';
  let userInfoHtml = '';
  if (type === 'sent') {
    userInfoHtml = `<span style="font-weight:600;">To ${user ? user.username : '?'}</span>
                    <span style="color:#888;font-size:0.95em;margin-left:8px;">${time}</span>`;
  } else {
    userInfoHtml = `<span style="font-weight:600;">${user ? user.username : '?'}</span> <span style="color:#888;">send to you</span>
                    <span style="color:#888;font-size:0.95em;margin-left:8px;">${time}</span>`;
  }
  const card = document.createElement('div');
  card.className = 'share-record';
  card.innerHTML = `
    <div class="record-header" style="display:flex;align-items:center;gap:10px;">
      <img src="/static/avatars/${user && user.avatar ? user.avatar : 'default.png'}" class="user-avatar" style="width:36px;height:36px;border-radius:50%;object-fit:cover;margin-right:10px;">
      <div style="display:inline-block;vertical-align:middle;">
        ${userInfoHtml}
      </div>
    </div>
    ${renderSharedContent(share)}
    <div class="record-actions">
      ${type === 'sent' ? `<button class="action-btn withdraw-btn" onclick="revokeShare(${share.id})"><i class="bi bi-x-lg"></i> Withdraw</button>` : ''}
    </div>
  `;
  return card;
}

function renderSharedContent(share) {
  // 留言优先显示
  let messageHtml = '';
  if (share.share_message) {
    messageHtml = `<div class="share-message" style="margin-bottom:8px;color:#6366f1;font-weight:500;">${share.share_message}</div>`;
  }
  // 活动卡片复用 recent activity 样式
  if (share.activity_type) {
    return `
      ${messageHtml}
      <div class="activity-card" style="border:1px solid #e5e7eb;border-radius:10px;padding:10px 14px;margin-bottom:8px;display:flex;align-items:center;gap:16px;box-shadow:0 1px 4px #e5e7eb;">
        <span class="activity-icon" style="font-size:1.4em;">${getActivityIcon(share.activity_type)}</span>
        <div>
          <div style="font-weight:bold;font-size:1.05em;">${capitalize(share.activity_type)}</div>
          <div style="font-size:0.95em;color:#666;">${formatDate(share.date)}</div>
          <div style="font-size:0.95em;color:#666;">
            <span><i class="bi bi-clock"></i> ${share.duration} min</span>
            ${share.distance ? `<span style='margin-left:10px;'><i class="bi bi-geo"></i> ${share.distance} km</span>` : ''}
            ${share.reps ? `<span style='margin-left:10px;'><i class="bi bi-arrow-up-circle"></i> ${share.reps} reps</span>` : ''}
            <span style='margin-left:10px;'><i class="bi bi-fire"></i> ${share.calories} kcal</span>
          </div>
        </div>
      </div>
    `;
  }
  // 图表/仪表盘分享渲染
  if (share.snapshot) {
    // 自动解析字符串快照
    if (typeof share.snapshot === 'string') {
      try {
        share.snapshot = JSON.parse(share.snapshot);
      } catch (e) {
        console.error('快照解析失败', e, share.snapshot);
        return messageHtml + '<div style="color:#e57373;">快照数据损坏，无法显示图表。</div>';
      }
    }
    if (share.visualization_type === 'dashboard') {
      return messageHtml + renderDashboardSnapshotV2(share.snapshot);
    } else {
      return messageHtml + renderChartSnapshot(share.visualization_type, share.snapshot);
    }
  }
  return messageHtml;
}

function renderChartSnapshot(type, snapshot) {
  // 统计卡片类型特殊渲染
  if (snapshot.type === 'stat-card') {
    if (snapshot.cardType === 'calories-distance') {
      return `<div class="stat-card-group" style="display:flex;gap:24px;margin:24px 0;">
        <div class="stat-card" style="flex:1;padding:18px 0;text-align:center;background:#f8fafc;border-radius:12px;box-shadow:0 1px 4px #e5e7eb;">
          <div class="stat-value" style="font-size:2em;font-weight:bold;color:#6366f1;">${snapshot.calories}</div>
          <div class="stat-label" style="color:#888;">Total Calories</div>
        </div>
        <div class="stat-card" style="flex:1;padding:18px 0;text-align:center;background:#f8fafc;border-radius:12px;box-shadow:0 1px 4px #e5e7eb;">
          <div class="stat-value" style="font-size:2em;font-weight:bold;color:#6366f1;">${snapshot.distance}</div>
          <div class="stat-label" style="color:#888;">Total Distance (km)</div>
        </div>
      </div>`;
    } else if (snapshot.cardType === 'duration-activities') {
      return `<div class="stat-card-group" style="display:flex;gap:24px;margin:24px 0;">
        <div class="stat-card" style="flex:1;padding:18px 0;text-align:center;background:#f8fafc;border-radius:12px;box-shadow:0 1px 4px #e5e7eb;">
          <div class="stat-value" style="font-size:2em;font-weight:bold;color:#6366f1;">${snapshot.duration}</div>
          <div class="stat-label" style="color:#888;">Total Duration (mins)</div>
        </div>
        <div class="stat-card" style="flex:1;padding:18px 0;text-align:center;background:#f8fafc;border-radius:12px;box-shadow:0 1px 4px #e5e7eb;">
          <div class="stat-value" style="font-size:2em;font-weight:bold;color:#6366f1;">${snapshot.activities}</div>
          <div class="stat-label" style="color:#888;">Activities</div>
        </div>
      </div>`;
    }
  }
  // 日历类型渲染
  if (snapshot.type === 'calendar') {
    // 构建日历表格
    const year = snapshot.year;
    const month = snapshot.month;
    const activityDates = snapshot.activityDates || [];
    // 英文月份
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    // 英文星期
    const weekDays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    // 生成本月所有日期
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    let html = `<div style="margin:24px 0;text-align:center;">
      <div style='font-weight:bold;font-size:1.2em;margin-bottom:8px;'>${monthNames[month-1]} ${year}</div>
      <div style='display:grid;grid-template-columns:repeat(7,1fr);gap:4px;background:#f3f4f6;padding:8px 0;border-radius:8px;'>`;
    weekDays.forEach(d => html += `<div style='color:#888;font-size:0.95em;'>${d}</div>`);
    // 补齐前导空格
    for (let i = 0; i < firstDay.getDay(); i++) html += `<div></div>`;
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${month.toString().padStart(2,'0')}-${d.toString().padStart(2,'0')}`;
      const isActive = activityDates.includes(dateStr);
      html += `<div style='padding:6px 0;border-radius:50%;${isActive?"background:#6366f1;color:#fff;font-weight:bold;":''}'>${d}</div>`;
    }
    html += `</div></div>`;
    return html;
  }
  // 生成唯一id，防止多图表冲突
  const chartId = 'shared-chart-' + Math.random().toString(36).substr(2, 9);
  const labels = snapshot.data?.labels || [];
  const datasets = snapshot.data?.datasets || [];
  const hasValidData = datasets.some(ds => Array.isArray(ds.data) && ds.data.some(v => v !== null && v !== undefined));
  if (!labels.length || !datasets.length || !hasValidData) {
    return `<div class="chart-container" style="height:300px;margin-bottom:16px;display:flex;align-items:center;justify-content:center;color:#888;">No chart data to display.</div>`;
  }
  // 优先用快照里的type
  let chartType = snapshot.type || type;
  if (labels.length === 1) chartType = 'bar';
  setTimeout(() => {
    const ctx = document.getElementById(chartId)?.getContext('2d');
    if (ctx) {
      const data = JSON.parse(JSON.stringify(snapshot.data));
      const options = JSON.parse(JSON.stringify(snapshot.options || {responsive:true,maintainAspectRatio:false}));
      new Chart(ctx, {
        type: chartType || 'line',
        data: data,
        options: options
      });
    }
  }, 0);
  return `<div class="chart-container" style="height:300px;margin-bottom:16px;border:1px solid #e57373;"><canvas id="${chartId}"></canvas></div>`;
}

function renderDashboardSnapshot(snapshot) {
  // snapshot为数组，顺序渲染每个元素
  if (Array.isArray(snapshot)) {
    let html = '<div class="dashboard-container" style="display:flex;flex-direction:column;gap:24px;margin-bottom:16px;">';
    snapshot.forEach((item, idx) => {
      html += renderChartSnapshot(item.type, item);
    });
    html += '</div>';
    return html;
  }
  // ...原对象结构兼容逻辑...
  return '';
}

function getActivityIcon(type) {
  switch(type) {
    case 'running': return '<i class="bi bi-person-fill"></i>';
    case 'cycling': return '<i class="bi bi-bicycle"></i>';
    case 'swimming': return '<i class="bi bi-droplet"></i>';
    case 'walking': return '<i class="bi bi-person"></i>';
    case 'hiking': return '<i class="bi bi-tree"></i>';
    case 'dancing': return '<i class="bi bi-music-note-beamed"></i>';
    case 'jumping': return '<i class="bi bi-arrow-up-circle"></i>';
    case 'climbing': return '<i class="bi bi-graph-up"></i>';
    case 'skating': return '<i class="bi bi-snow"></i>';
    case 'skiing': return '<i class="bi bi-snow2"></i>';
    case 'pushup':
    case 'situp':
    case 'pullup':
    case 'squats':
    case 'plank':
    case 'lunges':
    case 'deadlift':
    case 'bench_press':
      return '<i class="bi bi-activity"></i>';
    case 'yoga': return '<i class="bi bi-flower2"></i>';
    case 'pilates': return '<i class="bi bi-flower2"></i>';
    case 'stretching': return '<i class="bi bi-flower2"></i>';
    case 'basketball': return '<i class="bi bi-basket"></i>';
    case 'tennis': return '<i class="bi bi-emoji-sunglasses"></i>';
    case 'badminton': return '<i class="bi bi-wind"></i>';
    case 'volleyball': return '<i class="bi bi-emoji-laughing"></i>';
    case 'football': return '<i class="bi bi-emoji-neutral"></i>';
    case 'golf': return '<i class="bi bi-flag"></i>';
    case 'other': return '<i class="bi bi-activity"></i>';
    default: return '<i class="bi bi-activity"></i>';
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString();
}

function revokeShare(id) {
  if (!confirm('Are you sure you want to withdraw this share?')) return;
  fetch(`/api/share/revoke/${id}`, { method: 'DELETE' })
    .then(res => res.json())
    .then(data => {
      loadSentShares();
      alert(data.message || 'Share revoked.');
    });
}

// 新增：专门用于dashboard快照的渲染
function renderDashboardSnapshotV2(snapshot) {
  if (!Array.isArray(snapshot)) return '';
  let html = '<div class="dashboard-container" style="display:flex;flex-direction:column;gap:24px;margin-bottom:16px;">';
  snapshot.forEach((item, idx) => {
    if (item.type === 'stat-card') {
      html += renderChartSnapshot(item.type, item);
    } else if (item.type === 'calendar') {
      html += renderChartSnapshot(item.type, item);
    } else if (['bar','line','pie','doughnut'].includes(item.type)) {
      // 图表类型，labels和datasets必须存在且为非空数组
      const labels = item.data?.labels || [];
      const datasets = item.data?.datasets || [];
      if (Array.isArray(labels) && labels.length && Array.isArray(datasets) && datasets.length) {
        html += renderChartSnapshot(item.type, item);
      }
    }
  });
  html += '</div>';
  return html;
} 
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
  fetch('/api/friend/friends')
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
    const message = messageInput.value.trim();
    if (!friendId) {
      statusDiv.textContent = 'Please select a friend.';
      return;
    }
    
    statusDiv.textContent = 'Sharing...';
    let url = '/api/share/activity';
    
    // 创建 FormData 对象
    const formData = new FormData();
    formData.append('share_to_user_id', friendId);
    formData.append('share_message', message);
    formData.append('share_type', shareOptions.type);
    formData.append('visualization_type', shareOptions.id);
    
    if (shareOptions.type === 'activity') {
      formData.append('activity_id', shareOptions.id);
    }
    
    // 添加快照数据
    const snapshot = collectSnapshot(shareOptions.id);
    if (snapshot) {
      formData.append('snapshot', JSON.stringify(snapshot));
    }
    
    // 添加 CSRF Token
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    formData.append('csrf_token', csrfToken);
    
    fetch(url, {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          statusDiv.style.color = '#388e3c';
          statusDiv.textContent = 'Share successful!';
          setTimeout(() => { modal.style.display = 'none'; }, 1200);
        } else {
          statusDiv.style.color = '#d32f2f';
          statusDiv.textContent = data.message || 'Share failed.';
          if (data.errors) {
            console.error('Form validation errors:', data.errors);
          }
        }
      })
      .catch(() => {
        statusDiv.style.color = '#d32f2f';
        statusDiv.textContent = 'Share failed.';
      });
  };
};

// 采集快照参数
function collectSnapshot(type) {
  if (type === 'dashboard') {
    // 采集 dashboard 所有图表和统计卡片，顺序push到数组
    const snapshot = [];
    // 统计卡片
    const calories = document.getElementById('total-calories')?.textContent || '';
    const distance = document.getElementById('total-distance')?.textContent || '';
    snapshot.push({
      type: 'stat-card',
      cardType: 'calories-distance',
      calories,
      distance,
      filters: currentFilters
    });
    const duration = document.getElementById('total-duration')?.textContent || '';
    const activities = document.getElementById('activity-count')?.textContent || '';
    snapshot.push({
      type: 'stat-card',
      cardType: 'duration-activities',
      duration,
      activities,
      filters: currentFilters
    });
    // 日历快照
    snapshot.push({
      type: 'calendar',
      year: currentDate.getFullYear(),
      month: currentDate.getMonth() + 1,
      activityDates: Array.from(activityDates),
      filters: currentFilters
    });
    // 主图表
    if (charts.weekly) snapshot.push({
      type: 'bar',
      data: JSON.parse(JSON.stringify(charts.weekly.data)),
      options: JSON.parse(JSON.stringify(charts.weekly.options)),
      filters: currentFilters
    });
    if (charts.progress) snapshot.push({
      type: 'line',
      data: JSON.parse(JSON.stringify(charts.progress.data)),
      options: JSON.parse(JSON.stringify(charts.progress.options)),
      filters: currentFilters
    });
    if (charts.activities) snapshot.push({
      type: 'pie',
      data: JSON.parse(JSON.stringify(charts.activities.data)),
      options: JSON.parse(JSON.stringify(charts.activities.options)),
      filters: currentFilters
    });
    if (charts.calories) snapshot.push({
      type: 'line',
      data: JSON.parse(JSON.stringify(charts.calories.data)),
      options: JSON.parse(JSON.stringify(charts.calories.options)),
      filters: currentFilters
    });
    if (charts.prediction) snapshot.push({
      type: 'line',
      data: JSON.parse(JSON.stringify(charts.prediction.data)),
      options: JSON.parse(JSON.stringify(charts.prediction.options)),
      filters: currentFilters
    });
    return snapshot;
  } else if (type === 'stat-calories-distance') {
    // 采集统计卡片：卡路里+距离
    const calories = document.getElementById('total-calories')?.textContent || '';
    const distance = document.getElementById('total-distance')?.textContent || '';
    return {
      type: 'stat-card',
      cardType: 'calories-distance',
      calories,
      distance,
      filters: currentFilters
    };
  } else if (type === 'stat-duration-activities') {
    // 采集统计卡片：时长+活动数
    const duration = document.getElementById('total-duration')?.textContent || '';
    const activities = document.getElementById('activity-count')?.textContent || '';
    return {
      type: 'stat-card',
      cardType: 'duration-activities',
      duration,
      activities,
      filters: currentFilters
    };
  } else if (type === 'calendar') {
    // 采集日历快照：当前年月、已打卡日期、过滤器
    return {
      type: 'calendar',
      year: currentDate.getFullYear(),
      month: currentDate.getMonth() + 1, // 1-12
      activityDates: Array.from(activityDates),
      filters: currentFilters
    };
  } else {
    // 采集单个图表的状态
    const chart = charts[type];
    if (chart) {
      // 深拷贝 options，去掉 Proxy
      const options = JSON.parse(JSON.stringify(chart.options));
      return {
        type: chart.config.type,
        data: chart.data,
        options: options,
        filters: currentFilters
      };
    }
    return null;
  }
}

// 供所有页面调用 window.openShareModal({type, id}) 
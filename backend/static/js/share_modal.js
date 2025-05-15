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
      body.snapshot = collectSnapshot(shareOptions.id);
      console.log('分享快照:', body.snapshot);
    } else if (shareOptions.type === 'dashboard') {
      body.visualization_type = 'dashboard';
      body.snapshot = collectSnapshot('dashboard');
      console.log('分享快照:', body.snapshot);
    } else if (type === 'calendar') {
      // 采集日历快照：当前年月、已打卡日期、过滤器
      body.snapshot = collectSnapshot('calendar');
      console.log('分享快照:', body.snapshot);
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
    // 主图表
    if (charts.weekly) snapshot.push({type: charts.weekly.config.type, data: charts.weekly.data, options: JSON.parse(JSON.stringify(charts.weekly.options)), filters: currentFilters});
    if (charts.progress) snapshot.push({type: charts.progress.config.type, data: charts.progress.data, options: JSON.parse(JSON.stringify(charts.progress.options)), filters: currentFilters});
    if (charts.activities) snapshot.push({type: charts.activities.config.type, data: charts.activities.data, options: JSON.parse(JSON.stringify(charts.activities.options)), filters: currentFilters});
    if (charts.calories) snapshot.push({type: charts.calories.config.type, data: charts.calories.data, options: JSON.parse(JSON.stringify(charts.calories.options)), filters: currentFilters});
    if (charts.prediction) snapshot.push({type: charts.prediction.config.type, data: charts.prediction.data, options: JSON.parse(JSON.stringify(charts.prediction.options)), filters: currentFilters});
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
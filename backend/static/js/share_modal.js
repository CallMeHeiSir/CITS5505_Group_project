// General share modal logic
window.openShareModal = function(shareOptions) {
  // shareOptions: { type: 'activity'|'chart'|'dashboard', id: activity id/chart type/etc. }
  const modal = document.getElementById('share-modal');
  const closeBtn = document.getElementById('share-modal-close');
  const friendSelect = document.getElementById('share-friend-select');
  const messageInput = document.getElementById('share-message');
  const confirmBtn = document.getElementById('share-modal-confirm');
  const statusDiv = document.getElementById('share-modal-status');

  // Clear status
  friendSelect.innerHTML = '<option value="">Loading...</option>';
  messageInput.value = '';
  statusDiv.textContent = '';
  modal.style.display = 'flex';

  // Fetch friends list
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

  // Close modal
  closeBtn.onclick = () => { modal.style.display = 'none'; };
  window.onclick = e => { if (e.target === modal) modal.style.display = 'none'; };

  // Share button
  confirmBtn.onclick = () => {
    const friendId = friendSelect.value;
    const message = messageInput.value.trim();
    if (!friendId) {
      statusDiv.textContent = 'Please select a friend.';
      return;
    }
    
    statusDiv.textContent = 'Sharing...';
    let url = '/api/share/activity';
    
    // Create FormData object
    const formData = new FormData();
    formData.append('share_to_user_id', friendId);
    formData.append('share_message', message);
    formData.append('share_type', shareOptions.type);
    formData.append('visualization_type', shareOptions.id);
    
    if (shareOptions.type === 'activity') {
      formData.append('activity_id', shareOptions.id);
    }
    
    // Add snapshot data
    const snapshot = collectSnapshot(shareOptions.id);
    if (snapshot) {
      formData.append('snapshot', JSON.stringify(snapshot));
    }
    
    // Add CSRF Token
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

// Collect snapshot parameters
function collectSnapshot(type) {
  // 1. If charts is undefined, it's not a visualization page, compatible with recent activity, etc.
  if (typeof charts === 'undefined') {
    // For recent activity card, collect basic data on the card
    if (type === 'stat-calories-distance' || type === 'stat-card') {
      const calories = document.getElementById('total-calories')?.textContent || '';
      const distance = document.getElementById('total-distance')?.textContent || '';
      return {
        type: 'stat-card',
        cardType: 'calories-distance',
        calories,
        distance
      };
    } else if (type === 'duration-activities') {
      const duration = document.getElementById('total-duration')?.textContent || '';
      const activities = document.getElementById('activity-count')?.textContent || '';
      return {
        type: 'stat-card',
        cardType: 'duration-activities',
        duration,
        activities
      };
    }
    // Other types can be extended as needed
    return null;
  }
  // 2. Original logic for visualization page
  if (type === 'dashboard') {
    // Collect all charts and stat cards on the dashboard, push to array in order
    const snapshot = [];
    // Stat card
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
    // Calendar snapshot
    snapshot.push({
      type: 'calendar',
      year: currentDate.getFullYear(),
      month: currentDate.getMonth() + 1,
      activityDates: Array.from(activityDates),
      filters: currentFilters
    });
    // Main charts
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
    const calories = document.getElementById('total-calories')?.textContent || '';
    const distance = document.getElementById('total-distance')?.textContent || '';
    return {
      type: 'stat-card',
      cardType: 'calories-distance',
      calories,
      distance,
      filters: currentFilters
    };
  } else if (type === 'duration-activities') {
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
    return {
      type: 'calendar',
      year: currentDate.getFullYear(),
      month: currentDate.getMonth() + 1,
      activityDates: Array.from(activityDates),
      filters: currentFilters
    };
  } else {
    const chart = charts[type];
    if (chart) {
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

// For all pages to call: window.openShareModal({type, id})
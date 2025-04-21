// 圆环图
new Chart(document.getElementById('calorieChart'), {
  type: 'doughnut',
  data: {
    labels: ['Burned','Remaining'],
    datasets:[{
      data: [530, 1000-530],
      backgroundColor: ['#667eea','#e2e8f0'],
      borderWidth: 0
    }]
  },
  options:{
    cutout: '70%',
    plugins:{ legend:{ display:false } }
  }
});

// 折线图
new Chart(document.getElementById('performanceChart'), {
  type: 'line',
  data:{
    labels: ['Jan','Feb','Mar','Apr'],
    datasets:[{
      data:[200,350,300,450],
      fill:true, tension:0.4,
      borderColor:'#667eea',
      backgroundColor:'rgba(102,126,234,0.2)'
    }]
  },
  options:{
    plugins:{ legend:{ display:false } },
    scales:{
      x:{ grid:{ display:false } },
      y:{ grid:{ color:'#eee' } }
    }
  }
});

// 好友对比 & 分享提示
document.getElementById('selectFriend').onclick = () => {
  alert('弹出好友列表供选择');
};
document.getElementById('shareBtn').onclick = () => {
  const c = document.getElementById('commentBox').value;
  alert('已分享: ' + c);
};

// 图表配置和数据
const chartConfigs = {
  weekly: {
    type: 'bar',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Activity Duration (minutes)',
        data: [30, 45, 60, 30, 75, 45, 60],
        backgroundColor: 'rgba(102, 126, 234, 0.5)',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 1
      }]
    }
  },
  progress: {
    type: 'line',
    data: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [{
        label: 'Distance (km)',
        data: [10, 15, 13, 17],
        borderColor: 'rgba(102, 126, 234, 1)',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        tension: 0.4,
        fill: true
      }]
    }
  },
  calories: {
    type: 'doughnut',
    data: {
      labels: ['Burned', 'Goal'],
      datasets: [{
        data: [850, 1150],
        backgroundColor: [
          'rgba(102, 126, 234, 0.8)',
          'rgba(226, 232, 240, 0.5)'
        ],
        borderWidth: 0
      }]
    }
  },
  activities: {
    type: 'pie',
    data: {
      labels: ['Running', 'Cycling', 'Swimming', 'Other'],
      datasets: [{
        data: [45, 25, 20, 10],
        backgroundColor: [
          'rgba(102, 126, 234, 0.8)',
          'rgba(159, 122, 234, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(226, 232, 240, 0.8)'
        ],
        borderWidth: 0
      }]
    }
  }
};

// 通用图表选项
const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 20,
        usePointStyle: true
      }
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      titleColor: '#333',
      bodyColor: '#666',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      padding: 12,
      boxPadding: 6,
      usePointStyle: true,
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          label += context.parsed.y || context.parsed || 0;
          return label;
        }
      }
    }
  }
};

// 全局变量
let charts = {};
let currentFilters = {
  startDate: null,
  endDate: null,
  activityType: ''
};

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
  // 初始化日期范围选择器
  initializeDateFilter();
  
  // 初始化图表
  initializeCharts();
  
  // 加载初始数据
  updateData();
  
  // 添加过滤器事件监听
  document.getElementById('apply-filters').addEventListener('click', updateData);
});

// 初始化日期过滤器
function initializeDateFilter() {
  const dateRange = document.getElementById('date-range');
  const customDates = document.querySelector('.custom-dates');
  
  dateRange.addEventListener('change', function() {
    customDates.style.display = this.value === 'custom' ? 'block' : 'none';
    if (this.value !== 'custom') {
      setDefaultDates(this.value);
    }
  });
  
  // 设置默认日期范围（最近一个月）
  setDefaultDates('month');
}

// 设置默认日期范围
function setDefaultDates(range) {
  const endDate = new Date();
  let startDate = new Date();
  
  switch (range) {
    case 'week':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(endDate.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
  }
  
  currentFilters.startDate = startDate.toISOString().split('T')[0];
  currentFilters.endDate = endDate.toISOString().split('T')[0];
  
  if (document.getElementById('start-date')) {
    document.getElementById('start-date').value = currentFilters.startDate;
    document.getElementById('end-date').value = currentFilters.endDate;
  }
}

// 初始化图表
function initializeCharts() {
  // 活动时长图表
  charts.weekly = new Chart(document.getElementById('weeklyChart'), {
    type: 'bar',
    data: {
      labels: [],
      datasets: [{
        label: 'Duration (minutes)',
        data: [],
        backgroundColor: 'rgba(102, 126, 234, 0.5)',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Duration (minutes)'
          }
        }
      }
    }
  });
  
  // 距离进度图表
  charts.progress = new Chart(document.getElementById('progressChart'), {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Distance (km)',
        data: [],
        borderColor: 'rgba(102, 126, 234, 1)',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
  
  // 活动分布图表
  charts.activities = new Chart(document.getElementById('activitiesChart'), {
    type: 'doughnut',
    data: {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: [
          'rgba(102, 126, 234, 0.8)',
          'rgba(159, 122, 234, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(248, 113, 113, 0.8)',
          'rgba(45, 212, 191, 0.8)',
          'rgba(251, 146, 60, 0.8)'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
  
  // 卡路里趋势图表
  charts.calories = new Chart(document.getElementById('caloriesChart'), {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Calories',
        data: [],
        borderColor: 'rgba(236, 72, 153, 1)',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

// 更新数据和图表
async function updateData() {
  // 获取过滤条件
  const dateRange = document.getElementById('date-range').value;
  if (dateRange === 'custom') {
    currentFilters.startDate = document.getElementById('start-date').value;
    currentFilters.endDate = document.getElementById('end-date').value;
  }
  currentFilters.activityType = document.getElementById('activity-type').value;
  
  try {
    // 获取活动数据
    const response = await fetch(`/api/activities?start_date=${currentFilters.startDate}&end_date=${currentFilters.endDate}${currentFilters.activityType ? `&activity_type=${currentFilters.activityType}` : ''}`);
    const activities = await response.json();
    
    // 获取统计数据
    const statsResponse = await fetch(`/api/activities/stats?start_date=${currentFilters.startDate}&end_date=${currentFilters.endDate}${currentFilters.activityType ? `&activity_type=${currentFilters.activityType}` : ''}`);
    const stats = await statsResponse.json();
    
    // 更新统计卡片
    updateStats(stats);
    
    // 更新图表
    updateCharts(activities, stats);
  } catch (error) {
    console.error('Error fetching data:', error);
    showError('Failed to load data');
  }
}

// 更新统计数据
function updateStats(stats) {
  document.getElementById('total-calories').textContent = stats.total_calories.toLocaleString();
  document.getElementById('total-distance').textContent = stats.total_distance.toFixed(1);
  document.getElementById('total-duration').textContent = stats.total_duration.toLocaleString();
  document.getElementById('activity-count').textContent = stats.activity_count.toLocaleString();
}

// 更新图表
function updateCharts(activities, stats) {
  // 处理活动时长图表数据
  const dailyData = processActivityData(activities);
  charts.weekly.data.labels = dailyData.labels;
  charts.weekly.data.datasets[0].data = dailyData.durations;
  charts.weekly.update();
  
  // 处理距离进度图表数据
  const progressData = processProgressData(activities);
  charts.progress.data.labels = progressData.labels;
  charts.progress.data.datasets[0].data = progressData.distances;
  charts.progress.update();
  
  // 处理活动分布图表数据
  charts.activities.data.labels = Object.keys(stats.activity_types);
  charts.activities.data.datasets[0].data = Object.values(stats.activity_types);
  charts.activities.update();
  
  // 处理卡路里趋势图表数据
  const caloriesData = processCaloriesData(activities);
  charts.calories.data.labels = caloriesData.labels;
  charts.calories.data.datasets[0].data = caloriesData.calories;
  charts.calories.update();
}

// 处理活动数据
function processActivityData(activities) {
  const data = {
    labels: [],
    durations: []
  };
  
  // 按日期分组活动
  const dailyActivities = activities.reduce((acc, activity) => {
    const date = activity.date.split('T')[0];
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += activity.duration;
    return acc;
  }, {});
  
  // 转换为数组格式
  Object.entries(dailyActivities).forEach(([date, duration]) => {
    data.labels.push(new Date(date).toLocaleDateString());
    data.durations.push(duration);
  });
  
  return data;
}

// 处理进度数据
function processProgressData(activities) {
  const data = {
    labels: [],
    distances: []
  };
  
  // 按日期分组并累计距离
  let totalDistance = 0;
  activities.forEach(activity => {
    totalDistance += activity.distance || 0;
    data.labels.push(new Date(activity.date).toLocaleDateString());
    data.distances.push(totalDistance);
  });
  
  return data;
}

// 处理卡路里数据
function processCaloriesData(activities) {
  const data = {
    labels: [],
    calories: []
  };
  
  activities.forEach(activity => {
    data.labels.push(new Date(activity.date).toLocaleDateString());
    data.calories.push(activity.calories);
  });
  
  return data;
}

// 导出数据
async function exportData(format) {
  try {
    const response = await fetch(`/api/export/${format}`);
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    if (format === 'json') {
      const data = await response.json();
      downloadJSON(data, 'fitness_data.json');
    } else {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fitness_data.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    }
  } catch (error) {
    console.error('Export error:', error);
    showError('Failed to export data');
  }
}

// 下载JSON文件
function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  a.remove();
}

// 显示错误消息
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.innerHTML = `
    <i class="bi bi-exclamation-circle"></i>
    <span>${message}</span>
  `;
  document.body.appendChild(errorDiv);
  setTimeout(() => errorDiv.remove(), 3000);
}

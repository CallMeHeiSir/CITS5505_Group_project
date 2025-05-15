// Friend comparison and sharing functionality
// 删除 selectFriend 和 shareBtn 的相关 DOM 操作

// Chart configurations and data templates
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

// Common chart options for all visualizations
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

// Global variables for chart management
let charts = {};
let currentFilters = {
  startDate: null,
  endDate: null,
  activityType: ''
};

// Calendar functionality
let currentDate = new Date();
let activityDates = new Set();

function renderCalendar() {
  function pad(n) { return n < 10 ? '0' + n : n; }
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Update month header
  const monthHeader = document.getElementById('current-month');
  if (monthHeader) {
    monthHeader.textContent = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    monthHeader.style.display = '';
  }
  const prevBtn = document.getElementById('prev-month');
  if (prevBtn) prevBtn.style.display = '';
  const nextBtn = document.getElementById('next-month');
  if (nextBtn) nextBtn.style.display = '';

  // Get first day of month
  const firstDay = new Date(year, month, 1);
  const startingDay = firstDay.getDay();

  // Get last day of month
  const lastDay = new Date(year, month + 1, 0);
  const totalDays = lastDay.getDate();

  // Get days from previous month
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const calendarDays = document.getElementById('calendar-days');
  calendarDays.innerHTML = '';

  // 只生成需要的格子数（5行或6行）
  let totalCells = startingDay + totalDays;
  let cellCount = totalCells <= 35 ? 35 : 42;

  let dayCount = 0;
  for (let i = 0; i < cellCount; i++) {
    const cell = document.createElement('div');
    cell.className = 'calendar-day';
    cell.style.textAlign = 'center';
    cell.style.padding = '8px 0';

    let dateNum, dateStr, isCurrentMonth = true;
    const week = Math.floor(i / 7);
    const day = i % 7;

    if (week === 0 && day < startingDay) {
      // 上月
      dateNum = prevMonthLastDay - (startingDay - day - 1);
      cell.classList.add('other-month');
      isCurrentMonth = false;
      let prevMonth = month === 0 ? 12 : month;
      let prevYear = month === 0 ? year - 1 : year;
      dateStr = `${prevYear}-${pad(prevMonth)}-${pad(dateNum)}`;
    } else if (dayCount >= totalDays) {
      // 下月
      dateNum = dayCount - totalDays + 1;
      cell.classList.add('other-month');
      isCurrentMonth = false;
      let nextMonth = month === 11 ? 1 : month + 2;
      let nextYear = month === 11 ? year + 1 : year;
      dateStr = `${nextYear}-${pad(nextMonth)}-${pad(dateNum)}`;
      dayCount++;
    } else {
      // 本月
      dateNum = dayCount + 1;
      dateStr = `${year}-${pad(month + 1)}-${pad(dateNum)}`;
      dayCount++;
    }

    cell.textContent = dateNum;

    // 判断有无运动
    const hasActivity = activityDates.has(dateStr);

    // 高亮今天
    const today = new Date();
    const isToday =
      isCurrentMonth &&
      dateNum === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear();

    if (hasActivity && isToday) {
      // 今天且有运动
      cell.style.background = '#6366f1';
      cell.style.color = '#fff';
      cell.style.fontWeight = 'bold';
      cell.style.border = '2px solid #374151';
      cell.style.borderRadius = '50%';
    } else if (hasActivity) {
      // 有运动
      cell.style.background = '#6366f1';
      cell.style.color = '#fff';
      cell.style.fontWeight = 'bold';
      cell.style.borderRadius = '50%';
    } else if (isToday) {
      // 仅今天
      cell.style.border = '2px solid #6366f1';
      cell.style.borderRadius = '50%';
    }

    // 灰色显示其他月
    if (!isCurrentMonth) {
      cell.style.opacity = '0.4';
    }

    calendarDays.appendChild(cell);
  }
}

// Prediction functionality
function predictCalories(activities) {
  if (activities.length < 1) return null;

  // 用最近7天的均值（或全部均值）
  const recent = activities.slice(-7);
  const avg = recent.reduce((sum, a) => sum + a.calories, 0) / recent.length;
  const maxVal = avg * 1.08;

  const predictions = [];
  const lastDate = new Date(activities[activities.length - 1].date);

  for (let i = 0; i < 30; i++) {
    const date = new Date(lastDate);
    date.setDate(lastDate.getDate() + i);

    // 线性插值：从avg平滑递增到maxVal
    const t = i / 29; // 0~1
    const predicted = avg + (maxVal - avg) * t;

    predictions.push({
      date: date.toISOString().split('T')[0],
      calories: predicted
    });
  }

  return predictions;
}

// Initialize the visualization page
document.addEventListener('DOMContentLoaded', function() {
  // Initialize date range picker
  initializeDateFilter();
  
  // Initialize all charts
  initializeCharts();
  
  // Load initial data
  updateData();
  
  // Add event listener for filter application
  document.getElementById('apply-filters').addEventListener('click', updateData);
  
  // Initialize calendar
  renderCalendar();

  // 在初始化卡片时为每个分享按钮加上唯一的data-chart属性
  document.querySelectorAll('.card').forEach(card => {
    const shareBtn = card.querySelector('.share-btn');
    if (shareBtn) {
      const h5 = card.querySelector('h5');
      if (h5) {
        const title = h5.textContent.trim().toLowerCase();
        if (title.includes('activity calendar')) shareBtn.setAttribute('data-chart', 'calendar');
        else if (title.includes('activity duration by day') || title.includes('weekly')) shareBtn.setAttribute('data-chart', 'weekly');
        else if (title.includes('distance progress') || title.includes('progress')) shareBtn.setAttribute('data-chart', 'progress');
        else if (title.includes('activity distribution')) shareBtn.setAttribute('data-chart', 'activities');
        else if (title.includes('calories trend')) shareBtn.setAttribute('data-chart', 'calories');
        else if (title.includes('calories prediction') || title.includes('prediction')) shareBtn.setAttribute('data-chart', 'prediction');
      }
    }
  });

  // 针对stat-card统计卡片，手动赋予唯一data-chart（与charts key唯一对应）
  const statCards = document.querySelectorAll('.stat-card');
  if (statCards.length > 0) {
    // 第一组：Total Calories + Total Distance
    const btn0 = statCards[0].querySelector('.share-btn');
    if (btn0) btn0.setAttribute('data-chart', 'stat-calories-distance');
    // 第二组：Total Duration + Activities
    const btn1 = statCards[1].querySelector('.share-btn');
    if (btn1) btn1.setAttribute('data-chart', 'stat-duration-activities');
  }

  // 确保所有分享按钮都能正常弹出分享弹窗
  bindVisualizationShareButtons();
});

// Initialize date range filter functionality
function initializeDateFilter() {
  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
  const lastYear = new Date(today);
  lastYear.setDate(today.getDate() - 365);

  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');
  const dateRangeSelect = document.getElementById('date-range');
  const customDatesGroup = document.querySelector('.custom-dates');

  // 默认选中"Last Month"
  dateRangeSelect.value = 'month';
  startDateInput.value = lastMonth.toISOString().split('T')[0];
  endDateInput.value = today.toISOString().split('T')[0];

  currentFilters.startDate = lastMonth.toISOString().split('T')[0];
  currentFilters.endDate = today.toISOString().split('T')[0];

  // 默认隐藏 custom range
  if (customDatesGroup) customDatesGroup.style.display = 'none';

  dateRangeSelect.addEventListener('change', function() {
    if (this.value === 'week') {
      const lastWeek = new Date(today);
      lastWeek.setDate(today.getDate() - 7);
      startDateInput.value = lastWeek.toISOString().split('T')[0];
      endDateInput.value = today.toISOString().split('T')[0];
      if (customDatesGroup) customDatesGroup.style.display = 'none';
    } else if (this.value === 'month') {
      startDateInput.value = lastMonth.toISOString().split('T')[0];
      endDateInput.value = today.toISOString().split('T')[0];
      if (customDatesGroup) customDatesGroup.style.display = 'none';
    } else if (this.value === 'year') {
      const lastYear = new Date(today);
      lastYear.setDate(today.getDate() - 365);
      startDateInput.value = lastYear.toISOString().split('T')[0];
      endDateInput.value = today.toISOString().split('T')[0];
      if (customDatesGroup) customDatesGroup.style.display = 'none';
    } else if (this.value === 'custom') {
      // custom range: 自动填充为所有运动数据的最早和最晚日期
      if (customDatesGroup) customDatesGroup.style.display = '';
      fetch('/api/visualization/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      .then(res => res.json())
      .then(data => {
        if (data.activities && data.activities.length > 0) {
          // activities 已按时间排序，取最早和最晚
          const dates = data.activities.map(a => a.date.split('T')[0]).sort();
          startDateInput.value = dates[0];
          endDateInput.value = dates[dates.length - 1];
        } else {
          // 没有数据，默认今天
          startDateInput.value = today.toISOString().split('T')[0];
          endDateInput.value = today.toISOString().split('T')[0];
        }
      });
    }
  });
}

// Initialize all charts with empty data
function initializeCharts() {
  // Weekly activity duration chart
  const weeklyCtx = document.getElementById('weeklyChart');
  if (weeklyCtx) {
    charts.weekly = new Chart(weeklyCtx, {
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
  }
  
  // Distance progress chart
  const progressCtx = document.getElementById('progressChart');
  if (progressCtx) {
    charts.progress = new Chart(progressCtx, {
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
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Distance (km)'
            }
          }
        }
      }
    });
  }

  // Activity distribution chart
  const activitiesCtx = document.getElementById('activitiesChart');
  if (activitiesCtx) {
    charts.activities = new Chart(activitiesCtx, {
      type: 'pie',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [
            'rgba(102, 126, 234, 0.8)',
            'rgba(159, 122, 234, 0.8)',
            'rgba(236, 72, 153, 0.8)',
            'rgba(226, 232, 240, 0.8)'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  // Calories trend chart
  const caloriesCtx = document.getElementById('caloriesChart');
  if (caloriesCtx) {
    charts.calories = new Chart(caloriesCtx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Calories',
          data: [],
          borderColor: 'rgba(102, 126, 234, 1)',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          fill: true
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
              text: 'Calories'
            }
          }
        }
      }
    });
  }

  // Prediction chart
  const predictionCtx = document.getElementById('predictionChart');
  if (predictionCtx) {
    charts.prediction = new Chart(predictionCtx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Actual Calories',
          data: [],
          borderColor: 'rgba(102, 126, 234, 1)',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          fill: true
        }, {
          label: 'Predicted Calories',
          data: [],
          borderColor: 'rgba(236, 72, 153, 1)',
          backgroundColor: 'rgba(236, 72, 153, 0.1)',
          fill: true,
          borderDash: [5, 5]
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
              text: 'Calories'
            }
          }
        }
      }
    });
  }
}

// Update data based on current filters
async function updateData() {
  try {
    // Update filters
    currentFilters.startDate = document.getElementById('startDate').value;
    currentFilters.endDate = document.getElementById('endDate').value;
    currentFilters.activityType = document.getElementById('activityType').value;

    console.log('Sending request with filters:', currentFilters);

    // Get data
    const response = await fetch('/api/visualization/activities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(currentFilters)
    });

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const data = await response.json();
    console.log('Received data:', data);
    
    // Validate data structure
    if (!data.weekly_data || !data.progress_data || !data.activity_distribution || !data.calories_trend) {
      console.error('Missing required data fields:', {
        hasWeeklyData: !!data.weekly_data,
        hasProgressData: !!data.progress_data,
        hasActivityDistribution: !!data.activity_distribution,
        hasCaloriesTrend: !!data.calories_trend
      });
      throw new Error('Invalid data structure received from server');
    }
    
    // Update activity dates for calendar
    activityDates = new Set(data.activities.map(a => a.date.split('T')[0]));
    
    // Update calendar
    renderCalendar();
    
    // Update stats
    updateStats(data.stats);
    
    // Update charts
    updateCharts(data);
    
    // Update prediction
    const predictions = predictCalories(data.activities);
    if (predictions) {
      updatePredictionChart(data.activities, predictions);
    }
    
  } catch (error) {
    console.error('Error updating data:', error);
    showError('Failed to update data: ' + error.message);
  }
}

// Update statistics display
function updateStats(stats) {
  console.log('Updating stats with:', stats);
  
  const totalDuration = document.getElementById('total-duration');
  const totalDistance = document.getElementById('total-distance');
  const totalCalories = document.getElementById('total-calories');
  const avgDuration = document.getElementById('avg-duration');
  const avgDistance = document.getElementById('avg-distance');
  const avgCalories = document.getElementById('avg-calories');
  const activityCount = document.getElementById('activity-count');

  if (totalDuration) totalDuration.textContent = Math.round(stats.total_duration);
  if (totalDistance) totalDistance.textContent = stats.total_distance.toFixed(1);
  if (totalCalories) totalCalories.textContent = Math.round(stats.total_calories);
  if (avgDuration) avgDuration.textContent = Math.round(stats.avg_duration);
  if (avgDistance) avgDistance.textContent = stats.avg_distance.toFixed(1);
  if (avgCalories) avgCalories.textContent = Math.round(stats.avg_calories);
  if (activityCount) activityCount.textContent = stats.count || 0;
}

// Update all charts with new data
function updateCharts(data) {
  console.log('Updating charts with data:', data);
  
  // Helper function to destroy chart if it exists
  function destroyChart(chart) {
    if (chart && typeof chart.destroy === 'function') {
      chart.destroy();
    }
  }
  
  // Update weekly activity chart
  if (charts.weekly) {
    console.log('Updating weekly chart with:', data.weekly_data);
    destroyChart(charts.weekly);
    const weeklyCtx = document.getElementById('weeklyChart');
    if (weeklyCtx) {
      charts.weekly = new Chart(weeklyCtx, {
        type: 'bar',
        data: {
          labels: data.weekly_data.labels,
          datasets: [{
            label: 'Duration (minutes)',
            data: data.weekly_data.duration,
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
    }
  }
  
  // Update progress chart
  if (charts.progress) {
    console.log('Updating progress chart with:', data.progress_data);
    destroyChart(charts.progress);
    const progressCtx = document.getElementById('progressChart');
    if (progressCtx) {
      charts.progress = new Chart(progressCtx, {
        type: 'line',
        data: {
          labels: data.progress_data.labels,
          datasets: [{
            label: 'Distance (km)',
            data: data.progress_data.distance,
            borderColor: 'rgba(102, 126, 234, 1)',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            fill: true
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
                text: 'Distance (km)'
              }
            }
          }
        }
      });
    }
  }

  // Update activity distribution chart
  if (charts.activities) {
    console.log('Updating activities chart with:', data.activity_distribution);
    destroyChart(charts.activities);
    const activitiesCtx = document.getElementById('activitiesChart');
    if (activitiesCtx) {
      charts.activities = new Chart(activitiesCtx, {
        type: 'pie',
        data: {
          labels: data.activity_distribution.labels,
          datasets: [{
            data: data.activity_distribution.data,
            backgroundColor: [
              'rgba(102, 126, 234, 0.8)',
              'rgba(159, 122, 234, 0.8)',
              'rgba(236, 72, 153, 0.8)',
              'rgba(226, 232, 240, 0.8)'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }
  }

  // Update calories trend chart
  if (charts.calories) {
    console.log('Updating calories chart with:', data.calories_trend);
    destroyChart(charts.calories);
    const caloriesCtx = document.getElementById('caloriesChart');
    if (caloriesCtx) {
      charts.calories = new Chart(caloriesCtx, {
        type: 'line',
        data: {
          labels: data.calories_trend.labels,
          datasets: [{
            label: 'Calories',
            data: data.calories_trend.data,
            borderColor: 'rgba(102, 126, 234, 1)',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            fill: true
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
                text: 'Calories'
              }
            }
          }
        }
      });
    }
  }
}

// Process calories data for visualization
function processCaloriesData(activities) {
  const caloriesData = {
    burned: 0,
    goal: 1000
  };
  
  activities.forEach(activity => {
    caloriesData.burned += activity.calories || 0;
  });
  
  return caloriesData;
}

// Export data in specified format
async function exportData(format) {
  try {
    const response = await fetch('/api/visualization/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        format: format,
        ...currentFilters
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to export data');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activities.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  } catch (error) {
    showError('Failed to export data: ' + error.message);
  }
}

function updatePredictionChart(activities, predictions) {
  const ctx = document.getElementById('predictionChart').getContext('2d');

  // 1. 实际数据
  let actualLabels = activities.map(a => a.date.split('T')[0]);
  let actualData = activities.map(a => a.calories);

  // 对真实区间按日期排序，且只保留有真实值的日期
  const actualPairs = actualLabels.map((d, i) => ({ date: d, value: actualData[i] }));
  actualPairs.sort((a, b) => new Date(a.date) - new Date(b.date));
  actualLabels = actualPairs.map(p => p.date);
  actualData = actualPairs.map(p => p.value);

  // 2. 预测数据
  const predictedLabels = predictions.map(p => p.date);
  const predictedData = predictions.map(p => p.calories);

  // 3. 找到最后一个实际日期
  const lastActualDate = actualLabels[actualLabels.length - 1];

  // 4. 预测区间（只取最后一个实际日期之后的预测）
  const predStartIdx = predictedLabels.findIndex(d => d > lastActualDate);
  const predLabelsAfter = predStartIdx >= 0 ? predictedLabels.slice(predStartIdx) : [];
  const predDataAfter = predStartIdx >= 0 ? predictedData.slice(predStartIdx) : [];

  // 5. allDates = 真实值日期（递增）+ 预测区间日期（递增）
  const allDates = [...actualLabels, ...predLabelsAfter];

  // 6. 对齐数据
  const actualFull = [...actualData, ...Array(predLabelsAfter.length).fill(null)];
  const predictedFull = [...Array(actualLabels.length).fill(null), ...predDataAfter];

  // Calculate current month calories
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthCalories = activities
    .filter(a => {
      const date = new Date(a.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, a) => sum + a.calories, 0);

  // Update current month calories display
  const currentMonthCaloriesElem = document.getElementById('current-month-calories');
  if (currentMonthCaloriesElem) currentMonthCaloriesElem.textContent = currentMonthCalories.toFixed(0);

  // Calculate predicted total
  const predictedTotal = predictions.reduce((sum, p) => sum + p.calories, 0);
  const predictedCaloriesElem = document.getElementById('predicted-calories');
  if (predictedCaloriesElem) predictedCaloriesElem.textContent = predictedTotal.toFixed(0);

  // Destroy old prediction chart if exists
  if (charts.prediction && typeof charts.prediction.destroy === 'function') {
    charts.prediction.destroy();
  }

  charts.prediction = new Chart(ctx, {
    type: 'line',
    data: {
      labels: allDates,
      datasets: [
        {
          label: 'Actual Calories',
          data: actualFull,
          borderColor: 'rgba(102, 126, 234, 1)',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          fill: true
        },
        {
          label: 'Predicted Calories',
          data: predictedFull,
          borderColor: 'rgba(255, 99, 132, 1)',
          borderDash: [5, 5],
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Calories'
          }
        }
      }
    }
  });
}

// Add event listeners for calendar navigation
document.getElementById('prev-month').addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

document.getElementById('next-month').addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

// Show error message
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);
  setTimeout(() => errorDiv.remove(), 3000);
}

// 保证bindVisualizationShareButtons时能正确获取data-chart
function bindVisualizationShareButtons() {
  document.querySelectorAll('.share-btn').forEach(btn => {
    btn.onclick = function() {
      const chartType = this.getAttribute('data-chart');
      if (chartType) {
        window.openShareModal({ type: 'chart', id: chartType });
      }
    };
  });
  // dashboard分享按钮
  const dashboardBtn = document.getElementById('share-dashboard-btn') || document.querySelector('.share-dashboard-btn');
  if (dashboardBtn) {
    dashboardBtn.onclick = function() {
      window.openShareModal({ type: 'dashboard' });
    };
  }
}
bindVisualizationShareButtons();
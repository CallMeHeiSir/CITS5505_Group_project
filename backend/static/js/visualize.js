// Create a doughnut chart for calorie tracking
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

// Create a line chart for performance tracking
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

// Friend comparison and sharing functionality
document.getElementById('selectFriend').onclick = () => {
  alert('Show friend list for selection');
};
document.getElementById('shareBtn').onclick = () => {
  const c = document.getElementById('commentBox').value;
  alert('Shared: ' + c);
};

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
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Update month header
  document.getElementById('current-month').textContent = 
    currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  
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
  
  // Add days from previous month
  for (let i = startingDay - 1; i >= 0; i--) {
    const day = document.createElement('div');
    day.className = 'calendar-day other-month';
    day.textContent = prevMonthLastDay - i;
    calendarDays.appendChild(day);
  }
  
  // Add days of current month
  const today = new Date();
  for (let i = 1; i <= totalDays; i++) {
    const day = document.createElement('div');
    day.className = 'calendar-day';
    day.textContent = i;
    
    // Check if today
    if (i === today.getDate() && 
        month === today.getMonth() && 
        year === today.getFullYear()) {
      day.classList.add('today');
    }
    
    // Check if has activity
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    if (activityDates.has(dateStr)) {
      day.classList.add('has-activity');
    }
    
    calendarDays.appendChild(day);
  }
  
  // Add days from next month
  const remainingDays = 42 - (startingDay + totalDays); // 6 rows * 7 days
  for (let i = 1; i <= remainingDays; i++) {
    const day = document.createElement('div');
    day.className = 'calendar-day other-month';
    day.textContent = i;
    calendarDays.appendChild(day);
  }
}

// Prediction functionality
function predictCalories(activities) {
  if (activities.length < 2) return null;
  
  // Simple linear regression
  const x = activities.map((_, i) => i);
  const y = activities.map(a => a.calories);
  
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Predict next 30 days
  const predictions = [];
  const lastDate = new Date(activities[activities.length - 1].date);
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(lastDate);
    date.setDate(date.getDate() + i);
    
    predictions.push({
      date: date.toISOString().split('T')[0],
      calories: slope * (activities.length + i) + intercept
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
});

// Initialize date range filter functionality
function initializeDateFilter() {
  const dateRange = document.getElementById('date-range');
  const customDates = document.querySelector('.custom-dates');
  
  dateRange.addEventListener('change', function() {
    customDates.style.display = this.value === 'custom' ? 'block' : 'none';
    if (this.value !== 'custom') {
      setDefaultDates(this.value);
    }
  });
  
  // Set default date range to last month
  setDefaultDates('month');
}

// Set default date range based on selected period
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

// Initialize all charts with empty data
function initializeCharts() {
  // Weekly activity duration chart
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
  
  // Distance progress chart
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
    }
  });
}

// Update data based on current filters
async function updateData() {
  try {
    const response = await fetch('/analytics/api/activities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(currentFilters)
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    
    const data = await response.json();
    const activities = data.activities;
    const stats = data.stats;
    
    // Update activity dates for calendar
    activityDates = new Set(activities.map(a => a.date.split('T')[0]));
    
    // Update calendar
    renderCalendar();
    
    // Update stats
    updateStats(stats);
    
    // Update charts
    updateCharts(activities, stats);
    
    // Update prediction
    const predictions = predictCalories(activities);
    if (predictions) {
      updatePredictionChart(activities, predictions);
    }
    
  } catch (error) {
    showError('Failed to update data: ' + error.message);
  }
}

// Update statistics display
function updateStats(stats) {
  document.getElementById('total-activities').textContent = stats.totalActivities;
  document.getElementById('total-duration').textContent = stats.totalDuration;
  document.getElementById('total-distance').textContent = stats.totalDistance;
  document.getElementById('total-calories').textContent = stats.totalCalories;
}

// Update all charts with new data
function updateCharts(activities, stats) {
  // Update weekly activity chart
  const weeklyData = processActivityData(activities);
  charts.weekly.data.labels = weeklyData.labels;
  charts.weekly.data.datasets[0].data = weeklyData.data;
  charts.weekly.update();
  
  // Update progress chart
  const progressData = processProgressData(activities);
  charts.progress.data.labels = progressData.labels;
  charts.progress.data.datasets[0].data = progressData.data;
  charts.progress.update();
}

// Process activity data for visualization
function processActivityData(activities) {
  const weeklyData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    data: [0, 0, 0, 0, 0, 0, 0]
  };
  
  activities.forEach(activity => {
    const date = new Date(activity.date);
    const dayOfWeek = date.getDay();
    weeklyData.data[dayOfWeek] += activity.duration;
  });
  
  return weeklyData;
}

// Process progress data for visualization
function processProgressData(activities) {
  const progressData = {
    labels: [],
    data: []
  };
  
  // Group activities by week
  const weeklyGroups = {};
  activities.forEach(activity => {
    const date = new Date(activity.date);
    const weekNumber = Math.floor(date.getDate() / 7);
    if (!weeklyGroups[weekNumber]) {
      weeklyGroups[weekNumber] = 0;
    }
    weeklyGroups[weekNumber] += activity.distance || 0;
  });
  
  // Convert to arrays for chart
  Object.keys(weeklyGroups).forEach(week => {
    progressData.labels.push(`Week ${parseInt(week) + 1}`);
    progressData.data.push(weeklyGroups[week]);
  });
  
  return progressData;
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
    const response = await fetch('/analytics/api/activities/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        format: format,
        startDate: currentFilters.startDate,
        endDate: currentFilters.endDate
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to export data');
    }
    
    const data = await response.json();
    if (format === 'json') {
      downloadJSON(data, 'activities.json');
    } else {
      // Handle other formats here
    }
  } catch (error) {
    showError(error.message);
  }
}

// Download JSON data as file
function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Display error message
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

function updatePredictionChart(activities, predictions) {
  const ctx = document.getElementById('predictionChart').getContext('2d');
  
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
  document.getElementById('current-month-calories').textContent = currentMonthCalories.toFixed(0);
  
  // Calculate predicted total
  const predictedTotal = predictions.reduce((sum, p) => sum + p.calories, 0);
  document.getElementById('predicted-calories').textContent = predictedTotal.toFixed(0);
  
  // Create or update chart
  if (window.predictionChart) {
    window.predictionChart.destroy();
  }
  
  window.predictionChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [...activities.map(a => a.date.split('T')[0]), ...predictions.map(p => p.date)],
      datasets: [
        {
          label: 'Actual Calories',
          data: [...activities.map(a => a.calories), ...Array(predictions.length).fill(null)],
          borderColor: 'rgba(102, 126, 234, 1)',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          fill: true
        },
        {
          label: 'Predicted Calories',
          data: [...Array(activities.length).fill(null), ...predictions.map(p => p.calories)],
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

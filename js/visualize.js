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

// 时间范围选择器
function createDateFilter() {
  const filterContainer = document.createElement('div');
  filterContainer.className = 'date-filter';
  filterContainer.innerHTML = `
    <div class="filter-group">
      <label>Date Range:</label>
      <select id="date-range">
        <option value="week">Last Week</option>
        <option value="month">Last Month</option>
        <option value="year">Last Year</option>
        <option value="custom">Custom Range</option>
      </select>
    </div>
    <div class="custom-range" style="display: none;">
      <input type="date" id="start-date"/>
      <input type="date" id="end-date"/>
    </div>
    <button class="btn-gradient" onclick="applyDateFilter()">Apply</button>
  `;
  
  document.querySelector('.main-content').insertBefore(
    filterContainer,
    document.querySelector('.cards-row')
  );
  
  // 处理自定义日期范围显示
  const rangeSelect = filterContainer.querySelector('#date-range');
  const customRange = filterContainer.querySelector('.custom-range');
  rangeSelect.addEventListener('change', (e) => {
    customRange.style.display = e.target.value === 'custom' ? 'flex' : 'none';
  });
}

// 应用日期筛选
function applyDateFilter() {
  const range = document.getElementById('date-range').value;
  let startDate, endDate;
  
  if (range === 'custom') {
    startDate = document.getElementById('start-date').value;
    endDate = document.getElementById('end-date').value;
  } else {
    const now = new Date();
    endDate = now.toISOString().split('T')[0];
    switch (range) {
      case 'week':
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case 'month':
        startDate = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case 'year':
        startDate = new Date(now - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
    }
  }
  
  // TODO: 根据日期范围更新图表数据
  updateChartsData(startDate, endDate);
}

// 更新图表数据
function updateChartsData(startDate, endDate) {
  // 模拟数据更新
  Object.keys(charts).forEach(key => {
    const chart = charts[key];
    if (chart.config.type === 'bar' || chart.config.type === 'line') {
      chart.data.datasets.forEach(dataset => {
        dataset.data = dataset.data.map(() => Math.floor(Math.random() * 100));
      });
      chart.update();
    }
  });
}

// 导出数据
function exportData(format = 'csv') {
  const data = {
    weekly: charts.weekly.data,
    progress: charts.progress.data,
    calories: charts.calories.data,
    activities: charts.activities.data
  };
  
  switch (format) {
    case 'csv':
      exportAsCSV(data);
      break;
    case 'json':
      exportAsJSON(data);
      break;
    case 'pdf':
      exportAsPDF(data);
      break;
  }
}

// 导出为 CSV
function exportAsCSV(data) {
  let csv = 'data:text/csv;charset=utf-8,';
  
  // 添加表头
  csv += 'Date,Activity,Duration,Distance,Calories\n';
  
  // 添加数据
  const now = new Date();
  data.weekly.data.labels.forEach((day, index) => {
    const date = new Date(now - (6 - index) * 24 * 60 * 60 * 1000);
    csv += `${date.toISOString().split('T')[0]},`;
    csv += `Activity,`;
    csv += `${data.weekly.data.datasets[0].data[index]},`;
    csv += `${data.progress.data.datasets[0].data[index] || 0},`;
    csv += `${Math.floor(Math.random() * 500)}\n`;
  });
  
  // 触发下载
  const encodedUri = encodeURI(csv);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'fitness_data.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 导出为 JSON
function exportAsJSON(data) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'fitness_data.json');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 导出为 PDF
function exportAsPDF(data) {
  alert('PDF export feature coming soon!');
}

// 初始化所有图表
let charts = {};

document.addEventListener('DOMContentLoaded', function() {
  // 创建日期筛选器
  createDateFilter();
  
  // 初始化图表
  charts.weekly = new Chart(
    document.getElementById('weeklyChart'),
    {
      type: chartConfigs.weekly.type,
      data: chartConfigs.weekly.data,
      options: {
        ...commonOptions,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(226, 232, 240, 0.5)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    }
  );
  
  charts.progress = new Chart(
    document.getElementById('progressChart'),
    {
      type: chartConfigs.progress.type,
      data: chartConfigs.progress.data,
      options: {
        ...commonOptions,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(226, 232, 240, 0.5)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    }
  );
  
  // 添加图表交互
  Object.values(charts).forEach(chart => {
    chart.canvas.addEventListener('click', (e) => {
      const points = chart.getElementsAtEventForMode(
        e,
        'nearest',
        { intersect: true },
        false
      );
      
      if (points.length) {
        const point = points[0];
        showDataDetail(chart, point);
      }
    });
  });
  
  // 更新进度条动画
  document.querySelectorAll('.progress-fill').forEach(fill => {
    const width = fill.style.width;
    fill.style.width = '0';
    setTimeout(() => {
      fill.style.width = width;
    }, 100);
  });
});

// 显示数据详情
function showDataDetail(chart, point) {
  const datasetIndex = point.datasetIndex;
  const index = point.index;
  const value = chart.data.datasets[datasetIndex].data[index];
  const label = chart.data.labels[index];
  
  const modal = document.createElement('div');
  modal.className = 'data-detail-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Data Detail</h3>
        <button class="close-btn"><i class="bi bi-x"></i></button>
      </div>
      <div class="modal-body">
        <div class="detail-item">
          <span class="label">${label}</span>
          <span class="value">${value}</span>
        </div>
        <!-- Add more details as needed -->
      </div>
    </div>
  `;
  
  modal.querySelector('.close-btn').onclick = () => modal.remove();
  document.body.appendChild(modal);
}

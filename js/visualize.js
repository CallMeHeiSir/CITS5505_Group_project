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

document.addEventListener('DOMContentLoaded', function() {
  // 初始化周活动图表
  const weeklyChart = new Chart(document.getElementById('weeklyChart'), {
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
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

  // 初始化进度概览图表
  const progressChart = new Chart(document.getElementById('progressChart'), {
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
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
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

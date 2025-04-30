// challenge.js 升级版：加了筛选器功能！

document.addEventListener('DOMContentLoaded', function() {

  const challengesContainer = document.getElementById('challengesContainer');
  const categoryFilter = document.getElementById('categoryFilter');

  // 假数据：挑战数组
  const challenges = [
    {
      emoji: '🏃‍♂️',
      title: '7-Day Running Challenge',
      description: 'Run at least 3km every day for 7 days!',
      participants: 12,
      progress: 20,
      category: 'Running',
      joined: false
    },
    {
      emoji: '🥗',
      title: 'Healthy Eating Week',
      description: 'Eat vegetables and fruits every day for a week!',
      participants: 8,
      progress: 40,
      category: 'Healthy Eating',
      joined: false
    },
    {
      emoji: '💧',
      title: 'Daily Water Intake',
      description: 'Drink at least 2 liters of water every day!',
      participants: 20,
      progress: 60,
      category: 'Healthy Eating',
      joined: false
    },
    {
      emoji: '🧘',
      title: 'Yoga Everyday',
      description: 'Practice 30 minutes of yoga each day for 2 weeks!',
      participants: 14,
      progress: 30,
      category: 'Yoga',
      joined: false
    },
    {
      emoji: '🏋️‍♂️',
      title: 'Gym Strength Challenge',
      description: 'Hit the gym 4 times a week for a month!',
      participants: 18,
      progress: 50,
      category: 'Gym',
      joined: false
    },
    {
      emoji: '🥶',
      title: 'Cold Shower Challenge',
      description: 'Take a cold shower every morning for 10 days!',
      participants: 5,
      progress: 10,
      category: 'Others',
      joined: false
    },
    {
      emoji: '🏞',
      title: 'Weekend Hiking Adventure',
      description: 'Complete 3 hiking trips in a month!',
      participants: 9,
      progress: 35,
      category: 'Others',
      joined: false
    },
    {
      emoji: '🛏️',
      title: 'Sleep Well Challenge',
      description: 'Sleep 8 hours every night for 2 weeks!',
      participants: 16,
      progress: 70,
      category: 'Others',
      joined: false
    }
  ];

  // 加载挑战列表
  function loadChallenges(filter = 'All') {
    challengesContainer.innerHTML = '';

    const filteredChallenges = challenges.filter(challenge => {
      return filter === 'All' || challenge.category === filter;
    });

    filteredChallenges.forEach((challenge, index) => {
      const div = document.createElement('div');
      div.className = 'card challenge-card'; // 使用挑战专用卡片样式
      div.innerHTML = `
        <h3 style="margin-bottom: 8px;">${challenge.emoji} ${challenge.title}</h3>
        <p style="margin-bottom: 12px;">${challenge.description}</p>
        <div class="progress-bar" style="margin-bottom: 12px;">
          <div class="progress-fill" style="width: ${challenge.progress}%;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <small class="text-muted">👥 ${challenge.participants} Participants</small>
          <button class="btn-gradient join-btn" data-index="${index}" ${challenge.joined ? 'disabled' : ''}>
            ${challenge.joined ? '✅ Joined' : 'Join Now'}
          </button>
        </div>
      `;
      challengesContainer.appendChild(div);
    });
  }

  // 加入挑战逻辑
  challengesContainer.addEventListener('click', function(e) {
    const button = e.target.closest('.join-btn');
    if (button) {
      const index = button.dataset.index;
      if (!challenges[index].joined) {
        challenges[index].joined = true;
        challenges[index].participants += 1;
        loadChallenges(categoryFilter.value); // 重新渲染（保持当前筛选）
        alert(`You have joined the challenge: ${challenges[index].title}!`);
      }
    }
  });

  // 监听筛选器变化
  categoryFilter.addEventListener('change', function() {
    loadChallenges(this.value);
  });

  // 初始化加载所有挑战
  loadChallenges();

});

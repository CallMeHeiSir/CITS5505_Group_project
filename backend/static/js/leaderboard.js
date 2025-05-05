// leaderboard.js

document.addEventListener('DOMContentLoaded', function() {

  const leaderboardContainer = document.getElementById('leaderboardContainer');

  // 假数据
  const players = [
    {
      name: 'John Doe',
      points: 1500,
      description: '🏃 5K daily run master!',
      avatar: 'https://via.placeholder.com/80'
    },
    {
      name: 'Jane Smith',
      points: 1400,
      description: '🥗 Meal plan champion!',
      avatar: 'https://via.placeholder.com/80'
    },
    {
      name: 'Mike Lee',
      points: 1350,
      description: '📝 Forum top contributor!',
      avatar: 'https://via.placeholder.com/80'
    },
    {
      name: 'Alice Brown',
      points: 1300,
      description: '🧘 Yoga daily practitioner!',
      avatar: 'https://via.placeholder.com/80'
    }
  ];

  // 渲染排行榜
  function renderLeaderboard() {
    leaderboardContainer.innerHTML = '';

    // 按积分从高到低排序
    players.sort((a, b) => b.points - a.points);

    players.forEach((player, index) => {
      let medalColor = '';
      if (index === 0) medalColor = 'gold';
      else if (index === 1) medalColor = 'silver';
      else if (index === 2) medalColor = 'peru';

      const div = document.createElement('div');
      div.className = 'card';
      div.style = 'text-align: center; padding: 16px; position: relative;';

      div.innerHTML = `
        <div style="position: absolute; top: 16px; left: 16px; font-weight: bold; color: ${medalColor};">
          ${index === 0 ? '🥇 1st' : index === 1 ? '🥈 2nd' : index === 2 ? '🥉 3rd' : `#${index + 1}`}
        </div>
        <img src="${player.avatar}" alt="User Avatar" class="profile-img" style="margin-bottom: 8px;">
        <h4>${player.name}</h4>
        <span class="stat-value">${player.points} pts</span>
        <p class="text-muted" style="font-size: 0.85rem; margin-top: 8px;">${player.description}</p>
      `;

      leaderboardContainer.appendChild(div);
    });
  }

  // 初始化
  renderLeaderboard();

});

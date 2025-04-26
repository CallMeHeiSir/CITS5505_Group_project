// friends.js

document.addEventListener('DOMContentLoaded', function() {

  const friendsContainer = document.getElementById('friendsContainer');

  // 假数据：更丰富的好友列表
  const friends = [
    {
      name: 'John Doe',
      status: 'Doing: 5K Daily Run',
      online: true,
      level: 'Runner',
      lastActive: 'Today',
      interests: ['Running', 'Fitness']
    },
    {
      name: 'Jane Smith',
      status: 'Healthy Eating Challenge',
      online: false,
      level: 'Pro Eater',
      lastActive: '3 days ago',
      interests: ['Healthy Eating', 'Yoga']
    },
    {
      name: 'Alice Brown',
      status: 'Yoga Morning Routine',
      online: true,
      level: 'Yoga Master',
      lastActive: 'Today',
      interests: ['Yoga', 'Meditation']
    }
  ];

  // 加载好友列表
  function loadFriends() {
    friendsContainer.innerHTML = '';

    friends.forEach((friend, index) => {
      const div = document.createElement('div');
      div.className = 'forum-post challenge-card'; // 带hover动画

      div.innerHTML = `
        <div class="post-header" style="display: flex; align-items: center; gap: 8px;">
          <span style="width: 12px; height: 12px; background: ${friend.online ? 'limegreen' : 'gray'}; border-radius: 50%;"></span>
          <h3 class="post-title" style="display: flex; align-items: center; gap: 8px;">${friend.name}
            <span style="font-size: 0.75rem; background: #eee; padding: 2px 6px; border-radius: 8px;">🏅 ${friend.level}</span>
          </h3>
        </div>

        <p class="post-content" style="margin: 8px 0;">${friend.status}</p>

        <div style="margin-bottom: 8px; font-size: 0.85rem; color: #666;">
          ${friend.lastActive === 'Today' ? '🟢 Active today' : `🕒 Last seen ${friend.lastActive}`}
        </div>

        <div style="margin-bottom: 8px;">
          ${friend.interests.map(tag => `<span style="background: #eef; padding: 4px 8px; margin: 2px; border-radius: 6px; font-size: 0.75rem;">#${tag}</span>`).join('')}
        </div>

        <div class="post-actions">
          <button class="btn-text invite-btn" data-index="${index}">
            👟 Invite to Challenge
          </button>
        </div>
      `;
      friendsContainer.appendChild(div);
    });

    // 绑定Invite按钮逻辑
    document.querySelectorAll('.invite-btn').forEach(button => {
      button.addEventListener('click', function() {
        const index = this.dataset.index;
        this.innerHTML = '✅ Invited';
        this.disabled = true;
        this.style.opacity = 0.6;
        alert(`You have invited ${friends[index].name} to join a challenge!`);
      });
    });
  }

  // 初始加载
  loadFriends();

});

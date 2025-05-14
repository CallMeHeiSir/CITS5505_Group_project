// Wait for the DOM to be fully loaded before executing the code
document.addEventListener('DOMContentLoaded', function() {
  // Get form elements for login and registration
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = this.querySelector('input[type="email"]').value;
      const password = this.querySelector('input[type="password"]').value;
      console.log('Login attempt:', { email, password });
      window.location.href = 'upload.html';
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const username = this.querySelector('input[type="text"]').value;
      const email = this.querySelector('input[type="email"]').value;
      const password = this.querySelector('input[type="password"]').value;
      console.log('Register attempt:', { username, email, password });
      alert('Registration successful! Please login.');
      this.reset();
    });
  }

  const checkInBtn = document.getElementById('checkInBtn');
  const checkInProgress = document.getElementById('checkInProgress');
  const streakDays = document.getElementById('streakDays');

  // ✅ 自动从后端加载 streak 天数和进度条
  function loadStreakStatus() {
    fetch('/api/checkin/status')
      .then(res => res.json())
      .then(data => {
        const maxStreak = 5;
        streakDays.innerText = data.streak;
        let progress = Math.min(data.streak / maxStreak, 1) * 100;
        checkInProgress.style.width = progress + '%';
      })
      .catch(err => console.error('Failed to load streak:', err));
  }

  if (checkInBtn && checkInProgress && streakDays) {
    // 打卡点击事件
    checkInBtn.addEventListener('click', function () {
      fetch('/api/checkin', {
        method: 'POST'
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            streakDays.innerText = data.streak;
            const maxStreak = 5;
            let progress = Math.min(data.streak / maxStreak, 1) * 100;
            checkInProgress.style.width = progress + '%';
            alert('✅ Check-in successful!');
          } else {
            alert(data.message || 'Already checked in today.');
          }
        })
        .catch(err => {
          console.error('Check-in error:', err);
          alert('Check-in failed.');
        });
    });

    // ✅ 页面初始加载时调用
    loadStreakStatus();

  } else {
    console.error('Check-in elements not found:', {
      checkInBtn,
      checkInProgress,
      streakDays
    });
  }
});

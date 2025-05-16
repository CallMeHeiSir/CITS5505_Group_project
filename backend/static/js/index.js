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

  // ✅ Automatically load streak days and progress bar from backend
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

    // ✅ Call on initial page load
    loadStreakStatus();

  } else {
    console.error('Check-in elements not found:', {
      checkInBtn,
      checkInProgress,
      streakDays
    });
  }

  // ====== Home Page Recent Activities Summary ======
  function loadTodaySummary() {
    fetch('/analytics/api/activities/today_summary')
      .then(res => res.json())
      .then(data => {
        // Find the stats-grid under the recent activities card
        const statsGrid = document.querySelector('.card-recent-activities .stats-grid');
        if (statsGrid) {
          // Distance to 1 decimal, duration in minutes, calories as integer
          statsGrid.innerHTML = `
            <div class="stat-item">
              <span class="stat-value">${data.total_distance ? data.total_distance.toFixed(1) : '0.0'} km</span>
              <span class="stat-label">Distance</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${data.total_duration ? data.total_duration : 0} min</span>
              <span class="stat-label">Duration</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${data.total_calories ? data.total_calories : 0}</span>
              <span class="stat-label">Calories</span>
            </div>
          `;
        }
      })
      .catch(err => {
        // Show default content on failure
        const statsGrid = document.querySelector('.card-recent-activities .stats-grid');
        if (statsGrid) {
          statsGrid.innerHTML = `<div style='color:#888;'>Failed to load today's summary.</div>`;
        }
      });
  }
  loadTodaySummary();
});

window.addEventListener('unload', function() {
  // Use navigator.sendBeacon to ensure the request is sent
  navigator.sendBeacon('/auth/logout');
});
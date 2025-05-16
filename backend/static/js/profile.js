// profile.js

document.addEventListener('DOMContentLoaded', function() {

  const bioText = document.getElementById('bioText');
  const editBioBtn = document.getElementById('editBioBtn');
  const checkInBtn = document.getElementById('checkInBtn');
  const checkInProgress = document.getElementById('checkInProgress');
  const streakDays = document.getElementById('streakDays');

  // Edit bio
  editBioBtn.addEventListener('click', function() {
    const newBio = prompt("Enter your new bio:");
    if (newBio) {
      bioText.innerText = `"${newBio}"`;
      alert('Bio updated!');
    }
  });

  // Check-in functionality
  checkInBtn.addEventListener('click', function() {
    let progress = parseInt(checkInProgress.style.width);
    let days = parseInt(streakDays.innerText);

    if (progress >= 100) {
      alert('Already fully checked in for this cycle!');
      return;
    }

    progress += 10;
    days += 1;
    if (progress > 100) progress = 100;

    checkInProgress.style.width = progress + '%';
    streakDays.innerText = days;

    alert('Check-in successful!');
  });

  // Click badge to show details
  document.querySelectorAll('.badge-card').forEach(card => {
    card.addEventListener('click', function() {
      const message = this.getAttribute('data-message');
      alert('🏅 ' + message);
    });
  });

});

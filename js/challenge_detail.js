// challenge_detail.js

document.addEventListener('DOMContentLoaded', function() {

  const joinBtn = document.getElementById('joinChallengeBtn');
  const logProgressBtn = document.getElementById('logProgressBtn');

  joinBtn.addEventListener('click', function() {
    alert('You have joined this challenge!');
  });

  logProgressBtn.addEventListener('click', function() {
    alert('Progress logged for today! (future: update progress)');
  });

});

function openModal(type) {
    const modal = document.getElementById('modal');
    const text = document.getElementById('modal-text');
  
    if (type === 'about') {
      text.innerHTML = `
        <h3>About Us</h3>
        <p>We are a web development team from the University of Western Australia (UWA), Team Code 24. This platform is designed to help you achieve your fitness goals, build healthy habits, and improve your physical well-being.</p>
      `;
    } else if (type === 'connect') {
      text.innerHTML = `
        <h3>Contact Us</h3>
        <p>
          Email: contact@group24.com<br>
          Phone: +61 123 456 789<br>
          Address: 35 Stirling Highway, Nedlands, WA 6009<br>
          Instagram: @group24_team
        </p>
      `;
    } else if (type === 'help') {
      text.innerHTML = `
        <h3>Help</h3>
        <p>If you need help, please contact our support team.</p>
      `;
    }
  
    modal.style.display = "flex";
  }
  
  function closeModal() {
    document.getElementById('modal').style.display = "none";
  }
  
  window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
      closeModal();
    }
  }
  
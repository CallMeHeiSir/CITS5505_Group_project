// Set the current page's navigation item to active state
document.addEventListener('DOMContentLoaded', function() {
    // Get the current page's filename from the URL
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Find the corresponding navigation item and add active class
    const navItems = document.querySelectorAll('.side-item');
    navItems.forEach(item => {
        if (item.getAttribute('href') === currentPage) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}); 
// 设置当前页面的导航项为激活状态
document.addEventListener('DOMContentLoaded', function() {
    // 获取当前页面的文件名
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // 找到对应的导航项并添加激活类
    const navItems = document.querySelectorAll('.side-item');
    navItems.forEach(item => {
        if (item.getAttribute('href') === currentPage) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}); 
document.addEventListener('DOMContentLoaded', function() {
  // 使用事件委托绑定点击事件
  document.body.addEventListener('click', function(event) {
    if (event.target.classList.contains('flash-close')) {
      event.target.parentElement.style.display = 'none';
    }
  });
});
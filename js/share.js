document.addEventListener('DOMContentLoaded', function() {
  // 获取分享表单元素
  const shareForm = document.querySelector('.share-options');
  const dataSelect = shareForm.querySelector('select');
  const userInput = shareForm.querySelector('input[type="text"]');
  const shareButton = shareForm.querySelector('button');

  // 处理分享按钮点击
  shareButton.addEventListener('click', function() {
    const selectedData = dataSelect.value;
    const targetUser = userInput.value;

    if (!selectedData || !targetUser) {
      alert('Please select data and enter a username to share with');
      return;
    }

    // TODO: 发送分享请求到后端
    console.log('Share attempt:', { data: selectedData, user: targetUser });
    
    // 模拟分享成功
    alert('Data shared successfully!');
    dataSelect.value = '';
    userInput.value = '';
  });

  // TODO: 从后端获取已分享的数据列表
  // 这里使用模拟数据
  const sharedWithMe = [
    { user: 'Jacob', data: 'Running Data', time: '2h ago' },
    { user: 'Sarah', data: 'Swimming Stats', time: '1d ago' }
  ];

  const mySharedData = [
    { user: 'Mike', data: 'Running Data', time: '3h ago' },
    { user: 'Emma', data: 'Cycling Stats', time: '1d ago' }
  ];

  // 更新分享列表
  function updateShareLists() {
    // TODO: 实现动态更新分享列表的功能
  }
}); 
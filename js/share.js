// Initialize sharing functionality when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Get sharing form elements
  const shareForm = document.querySelector('.share-options');
  const dataSelect = shareForm.querySelector('select');
  const userInput = shareForm.querySelector('input[type="text"]');
  const shareButton = shareForm.querySelector('button');

  // Handle share button click
  shareButton.addEventListener('click', function() {
    const selectedData = dataSelect.value;
    const targetUser = userInput.value;

    if (!selectedData || !targetUser) {
      alert('Please select data and enter a username to share with');
      return;
    }

    // TODO: Send share request to backend
    console.log('Share attempt:', { data: selectedData, user: targetUser });
    
    // Simulate successful sharing
    alert('Data shared successfully!');
    dataSelect.value = '';
    userInput.value = '';
  });

  // TODO: Fetch shared data list from backend
  // Using mock data for now
  const sharedWithMe = [
    { user: 'Jacob', data: 'Running Data', time: '2h ago' },
    { user: 'Sarah', data: 'Swimming Stats', time: '1d ago' }
  ];

  const mySharedData = [
    { user: 'Mike', data: 'Running Data', time: '3h ago' },
    { user: 'Emma', data: 'Cycling Stats', time: '1d ago' }
  ];

  // Update sharing lists
  function updateShareLists() {
    // TODO: Implement dynamic update of sharing lists
  }
}); 
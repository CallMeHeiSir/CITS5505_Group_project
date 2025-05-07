// Constants for file upload validation
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const VALID_TYPES = ['.csv'];

// Get DOM elements
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const fileList = document.getElementById('file-list');
const uploadForm = document.getElementById('upload-form');
const manualEntryForm = document.getElementById('manual-entry-form');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const activityForm = document.getElementById('activity-form');

// Tab switching functionality
tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    const tabId = button.getAttribute('data-tab');
    
    // Update active tab button
    tabButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    // Show corresponding tab content
    tabContents.forEach(content => {
      content.classList.remove('active');
      if (content.id === tabId) {
        content.classList.add('active');
      }
    });
  });
});

// Handle manual form submission
manualEntryForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const formData = {
    sportEvent: document.getElementById('sport-event').value,
    sportType: document.getElementById('sport-type').value,
    duration: document.getElementById('duration').value,
    height: document.getElementById('height').value,
    weight: document.getElementById('weight').value,
    age: document.getElementById('age').value,
    location: document.getElementById('location').value
  };
  
  // TODO: Send form data to backend
  console.log('Manual entry data:', formData);
  
  // Show success message
  showSuccess('Data submitted successfully!');
  manualEntryForm.reset();
});

// Handle activity form submission
activityForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const formData = {
    activityType: activityForm.querySelector('[name="activity_type"]').value,
    date: activityForm.querySelector('[name="date"]').value,
    duration: activityForm.querySelector('[name="duration"]').value,
    distance: activityForm.querySelector('[name="distance"]').value,
    calories: activityForm.querySelector('[name="calories"]').value,
    height: activityForm.querySelector('[name="height"]').value,
    weight: activityForm.querySelector('[name="weight"]').value,
    age: activityForm.querySelector('[name="age"]').value,
    location: activityForm.querySelector('[name="location"]').value
  };
  
  // TODO: Send form data to backend
  console.log('Activity data:', formData);
  
  // Show success message
  showSuccess('Activity added successfully!');
  activityForm.reset();
  
  // Set default date to today
  activityForm.querySelector('[name="date"]').valueAsDate = new Date();
});

// Validate file size and type
function validateFile(file) {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds 5MB limit: ${file.name}`);
  }
  
  // Check file extension
  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  if (!VALID_TYPES.includes(ext)) {
    throw new Error(`Invalid file type: ${file.name}. Allowed types: ${VALID_TYPES.join(', ')}`);
  }
  
  return true;
}

// Create a preview element for uploaded file
function createFilePreview(file) {
  const div = document.createElement('div');
  div.className = 'file-preview';
  
  // Add file information
  div.innerHTML = `
    <div class="file-info">
      <i class="bi bi-file-earmark-text"></i>
      <span class="file-name">${file.name}</span>
      <span class="file-size">${(file.size / 1024).toFixed(1)} KB</span>
    </div>
    <div class="file-actions">
      <button type="button" class="preview-btn" title="Preview"><i class="bi bi-eye"></i></button>
      <button type="button" class="remove-btn" title="Remove"><i class="bi bi-x"></i></button>
    </div>
    <div class="progress-bar">
      <div class="progress-fill"></div>
    </div>
  `;
  
  // Add preview button event listener
  div.querySelector('.preview-btn').addEventListener('click', () => {
    previewFile(file);
  });
  
  // Add remove button event listener
  div.querySelector('.remove-btn').addEventListener('click', () => {
    div.remove();
    updateUploadButtonState();
  });
  
  return div;
}

// Preview file content
function previewFile(file) {
  if (file.type.startsWith('text')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      showPreviewModal(file.name, e.target.result);
    };
    reader.readAsText(file);
  }
}

// Display file preview in a modal
function showPreviewModal(fileName, content) {
  const modal = document.createElement('div');
  modal.className = 'preview-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>${fileName}</h3>
        <button class="close-btn"><i class="bi bi-x"></i></button>
      </div>
      <div class="modal-body">
        <pre>${content}</pre>
      </div>
    </div>
  `;
  
  modal.querySelector('.close-btn').onclick = () => modal.remove();
  document.body.appendChild(modal);
}

// Update upload button state based on file list
function updateUploadButtonState() {
  const hasFiles = fileList.children.length > 0;
  const uploadButton = uploadForm.querySelector('button[type="submit"]');
  uploadButton.disabled = !hasFiles;
  uploadButton.classList.toggle('btn-disabled', !hasFiles);
}

// Handle drag and drop events
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropZone.addEventListener(eventName, (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
});

// Add visual feedback for drag and drop
['dragenter', 'dragover'].forEach(eventName => {
  dropZone.addEventListener(eventName, () => {
    dropZone.classList.add('dragover');
  });
});

['dragleave', 'drop'].forEach(eventName => {
  dropZone.addEventListener(eventName, () => {
    dropZone.classList.remove('dragover');
  });
});

// Process selected files
function handleFiles(files) {
  Array.from(files).forEach(file => {
    try {
      validateFile(file);
      const previewElement = createFilePreview(file);
      fileList.appendChild(previewElement);
      updateUploadButtonState();
    } catch (error) {
      showError(error.message);
    }
  });
}

// Display error message
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.innerHTML = `
    <i class="bi bi-exclamation-circle"></i>
    <span>${message}</span>
  `;
  document.body.appendChild(errorDiv);
  setTimeout(() => errorDiv.remove(), 3000);
}

// Handle file drop
dropZone.addEventListener('drop', (e) => {
  const files = e.dataTransfer.files;
  handleFiles(files);
});

// Handle file input change
fileInput.addEventListener('change', (e) => {
  handleFiles(e.target.files);
});

// Handle form submission
uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const files = Array.from(fileList.children).map(div => {
    const fileName = div.querySelector('.file-name').textContent;
    const progressFill = div.querySelector('.progress-fill');
    return {
      name: fileName,
      updateProgress: (percent) => {
        progressFill.style.width = `${percent}%`;
      }
    };
  });
  
  // Simulate upload process
  for (const file of files) {
    for (let i = 0; i <= 100; i += 10) {
      file.updateProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  // Simulate upload completion
  setTimeout(() => {
    fileList.innerHTML = '';
    updateUploadButtonState();
    showSuccess('Files uploaded successfully!');
  }, 500);
});

// Display success message
function showSuccess(message) {
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.innerHTML = `
    <i class="bi bi-check-circle"></i>
    <span>${message}</span>
  `;
  document.body.appendChild(successDiv);
  setTimeout(() => successDiv.remove(), 3000);
}

// Initialize activity form functionality
document.addEventListener('DOMContentLoaded', function() {
  const activityForm = document.getElementById('activity-form');
  const activitiesList = document.querySelector('.activities-list');

  // Set default date to today
  document.getElementById('activity-date').valueAsDate = new Date();

  // Load recent activities
  loadRecentActivities();

  // Handle activity form submission
  activityForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(activityForm);
    const activityData = {
      activity_type: formData.get('activity_type'),
      date: formData.get('date'),
      duration: parseInt(formData.get('duration')),
      distance: parseFloat(formData.get('distance')) || 0,
      calories: parseInt(formData.get('calories')) || 0
    };

    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(activityData)
      });

      if (!response.ok) {
        throw new Error('Failed to add activity');
      }

      showSuccess('Activity added successfully!');
      activityForm.reset();
      document.getElementById('activity-date').valueAsDate = new Date();
      loadRecentActivities();
    } catch (error) {
      showError(error.message);
    }
  });

  var activityType = document.getElementById('activity_type');
  if (activityType) {
    activityType.addEventListener('change', function() {
      var type = this.value;
      var distanceGroup = document.getElementById('distance-group');
      var repsGroup = document.getElementById('reps-group');
      if (["running", "cycling", "swimming", "walking", "hiking", "yoga"].includes(type)) {
        distanceGroup.style.display = '';
        repsGroup.style.display = 'none';
      } else if (["pushup", "situp", "pullup"].includes(type)) {
        distanceGroup.style.display = 'none';
        repsGroup.style.display = '';
      } else {
        distanceGroup.style.display = '';
        repsGroup.style.display = '';
      }
    });
  }
});

// Load and display recent activities
function loadRecentActivities() {
  const recentActivitiesList = document.querySelector('.recent-activities-list');
  
  // TODO: Replace with actual API call to get recent activities
  const mockActivities = [
    { type: 'running', name: 'Morning Run', duration: '30 min', time: '2 hours ago' },
    { type: 'cycling', name: 'Evening Ride', duration: '45 min', time: 'Yesterday' },
    { type: 'swimming', name: 'Pool Session', duration: '60 min', time: '2 days ago' }
  ];

  recentActivitiesList.innerHTML = mockActivities.map(activity => `
    <li>
      <div class="activity-icon">
        <i class="bi bi-${getActivityIcon(activity.type)}"></i>
      </div>
      <div class="activity-details">
        <div class="activity-name">${activity.name}</div>
        <div class="activity-meta">${activity.duration} • ${activity.time}</div>
      </div>
    </li>
  `).join('');
}

// Get appropriate icon for activity type
function getActivityIcon(type) {
  const icons = {
    running: 'person-running',
    cycling: 'bicycle',
    swimming: 'water',
    walking: 'person-walking',
    hiking: 'tree',
    yoga: 'flower3',
    other: 'activity'
  };
  return icons[type] || 'activity';
}

// Display activities in the list
function displayActivities(activities) {
  const activitiesList = document.querySelector('.activities-list');
  activitiesList.innerHTML = '';
  
  activities.forEach(activity => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="activity-type">${activity.activity_type}</span>
      <span class="activity-date">${new Date(activity.date).toLocaleDateString()}</span>
      <span class="activity-duration">${activity.duration} min</span>
      <span class="activity-distance">${activity.distance} km</span>
      <span class="activity-calories">${activity.calories} cal</span>
    `;
    activitiesList.appendChild(li);
  });
}

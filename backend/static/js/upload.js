// Constants for file upload validation
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const VALID_TYPES = ['.csv'];

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
// Get DOM elements
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const fileList = document.getElementById('file-list');
const uploadForm = document.getElementById('upload-form');
const manualEntryForm = document.getElementById('manual-entry-form');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const activityForm = document.getElementById('activity-form');
  const activityTypeSelect = document.getElementById('activity_type');
  const distanceGroup = document.getElementById('distance-group');
  const repsGroup = document.getElementById('reps-group');
  
  // 检查必要的DOM元素是否存在
  if (!dropZone || !fileInput || !fileList || !uploadForm) {
    console.error('Required DOM elements not found');
    return;
  }

  // Handle file input change
  fileInput.addEventListener('change', (e) => {
    console.log('File input changed:', e.target.files);
    if (e.target.files.length > 0) {
      handleFiles(e.target.files);
  }
  });

  // Handle click on drop zone
  dropZone.addEventListener('click', (e) => {
    // 如果点击的是 drop zone 本身，则触发文件选择
    if (e.target === dropZone) {
      fileInput.click();
}
  });

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

  // Handle file drop
  dropZone.addEventListener('drop', (e) => {
    console.log('File dropped:', e.dataTransfer.files);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
});

// Process selected files
function handleFiles(files) {
    console.log('Handling files:', files);
    // 清空现有文件列表
    fileList.innerHTML = '';
    
  Array.from(files).forEach(file => {
    try {
      validateFile(file);
        // 只显示文件名,不创建预览
        const fileInfo = document.createElement('div');
        fileInfo.className = 'file-info';
        fileInfo.innerHTML = `
          <i class="bi bi-file-earmark-text"></i>
          <span class="file-name">${file.name}</span>
        `;
        fileList.appendChild(fileInfo);
      updateUploadButtonState();
    } catch (error) {
      showError(error.message);
    }
  });
}

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

  // Handle file upload form submission
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const files = Array.from(fileInput.files);
    if (files.length === 0) {
      showError('Please select at least one file');
      return;
    }
    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('csrf_token', document.querySelector('input[name="csrf_token"]').value);
        const response = await fetch('/analytics/api/activities/upload', {
          method: 'POST',
          body: formData
        });
        const result = await response.json();
        if (response.ok) {
          // 更新文件信息显示为上传成功
          const fileInfo = fileList.querySelector(`.file-name`);
          if (fileInfo) {
            fileInfo.innerHTML = `
              <i class="bi bi-check-circle-fill text-success"></i>
              <span class="file-name">${file.name} - Uploaded successfully</span>
            `;
          }
          showSuccess(result.message);
          loadRecentActivities(); // 刷新活动历史
        } else {
          showError(result.message || 'Failed to upload file');
        }
      } catch (error) {
        console.error('Upload error:', error);
        showError('Failed to connect to server');
      }
    }
    fileInput.value = '';
    updateUploadButtonState();
  });

  // Update upload button state based on file list
  function updateUploadButtonState() {
    const hasFiles = fileList.children.length > 0;
    const uploadButton = uploadForm.querySelector('button[type="submit"]');
    uploadButton.disabled = !hasFiles;
    uploadButton.classList.toggle('btn-disabled', !hasFiles);
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

  // Tab switching functionality
  if (tabButtons.length > 0 && tabContents.length > 0) {
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
  }

  // Handle manual form submission
  if (manualEntryForm) {
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
  }

  // Handle activity form submission
  if (activityForm) {
    activityForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      try {
        const formData = new FormData(activityForm);
        const data = {
          activityType: formData.get('activity_type'),
          date: formData.get('date'),
          duration: formData.get('duration'),
          distance: formData.get('distance'),
          reps: formData.get('reps'),
          height: formData.get('height'),
          weight: formData.get('weight'),
          age: formData.get('age'),
          location: formData.get('location')
        };
        
        const response = await fetch('/analytics/api/activities/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': document.querySelector('input[name="csrf_token"]').value
          },
          body: JSON.stringify(data)
        });
        
        const result = await response.json();
        if (result.status === 'success') {
          showSuccess(result.message);
          activityForm.reset();
          loadRecentActivities(); // 刷新活动历史
        } else {
          showError(result.message);
        }
      } catch (error) {
        console.error('Error submitting activity:', error);
        showError('Failed to submit activity');
      }
    });
  }

  // Handle activity type change
  if (activityTypeSelect && distanceGroup && repsGroup) {
    activityTypeSelect.addEventListener('change', () => {
      const aerobicTypes = [
        'running', 'cycling', 'swimming', 'walking', 'hiking',
        'dancing', 'jumping', 'climbing', 'skating', 'skiing'
      ];
      const strengthTypes = [
        'pushup', 'situp', 'pullup', 'squats', 'plank',
        'lunges', 'deadlift', 'bench_press'
      ];
      const selectedType = activityTypeSelect.value;
      if (aerobicTypes.includes(selectedType)) {
        distanceGroup.style.display = 'block';
        repsGroup.style.display = 'none';
      } else if (strengthTypes.includes(selectedType)) {
        distanceGroup.style.display = 'none';
        repsGroup.style.display = 'block';
      } else {
        distanceGroup.style.display = 'none';
        repsGroup.style.display = 'none';
      }
    });
  }

  // Render recent activities as cards
  async function loadRecentActivities() {
    const container = document.getElementById('recent-activities');
    if (!container) return;
    container.innerHTML = '<div style="text-align:center;color:#888;">Loading...</div>';
    try {
      const response = await fetch('/api/activities');
      const data = await response.json();
      if (!response.ok || !Array.isArray(data.activities)) {
        container.innerHTML = '<div style="text-align:center;color:#888;">No activities found.</div>';
        return;
      }
      if (data.activities.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:#888;">No activities found.</div>';
        return;
      }
      // Sort by date descending
      const activities = data.activities.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
      container.innerHTML = '';
      activities.forEach(activity => {
        const card = document.createElement('div');
        card.className = 'activity-card';
        card.dataset.activityId = activity.id;
        card.style = 'border:1px solid #e5e7eb; border-radius:12px; margin-bottom:12px; padding:12px 16px; display:flex; align-items:center; justify-content:space-between; box-shadow:0 1px 4px #e5e7eb;';
        card.innerHTML = `
          <div style="display:flex;align-items:center;gap:16px;">
            <span class="activity-icon" style="font-size:1.6em;">${getActivityIcon(activity.activity_type)}</span>
            <div>
              <div style="font-weight:bold;font-size:1.1em;">${capitalize(activity.activity_type)}</div>
              <div style="font-size:0.95em;color:#666;">${formatDate(activity.date)}</div>
            </div>
      </div>
          <div style="display:flex;align-items:center;gap:16px;">
            <span title="Duration"><i class="bi bi-clock"></i> ${activity.duration} min</span>
            ${activity.distance ? `<span title="Distance"><i class="bi bi-geo"></i> ${activity.distance} km</span>` : ''}
            ${activity.reps ? `<span title="Reps"><i class="bi bi-arrow-up-circle"></i> ${activity.reps} reps</span>` : ''}
            <span title="Calories"><i class="bi bi-fire"></i> ${activity.calories} kcal</span>
            <button class="share-btn" title="Share" style="background:none;border:none;cursor:pointer;font-size:1.2em;color:#6366f1;"><i class="bi bi-share"></i></button>
      </div>
        `;
        container.appendChild(card);
      });
      bindShareButtons();
    } catch (e) {
      container.innerHTML = '<div style="text-align:center;color:#888;">Failed to load activities.</div>';
    }
  }

function getActivityIcon(type) {
  switch(type) {
    case 'running': return '<i class="bi bi-person-fill"></i>';
    case 'cycling': return '<i class="bi bi-bicycle"></i>';
    case 'swimming': return '<i class="bi bi-droplet"></i>';
    case 'walking': return '<i class="bi bi-person"></i>';
    case 'hiking': return '<i class="bi bi-tree"></i>';
    case 'dancing': return '<i class="bi bi-music-note-beamed"></i>';
    case 'jumping': return '<i class="bi bi-arrow-up-circle"></i>';
    case 'climbing': return '<i class="bi bi-graph-up"></i>';
    case 'skating': return '<i class="bi bi-snow"></i>';
    case 'skiing': return '<i class="bi bi-snow2"></i>';
    case 'pushup':
    case 'situp':
    case 'pullup':
    case 'squats':
    case 'plank':
    case 'lunges':
    case 'deadlift':
    case 'bench_press':
      return '<i class="bi bi-activity"></i>';
    case 'yoga': return '<i class="bi bi-flower2"></i>';
    case 'pilates': return '<i class="bi bi-flower2"></i>';
    case 'stretching': return '<i class="bi bi-flower2"></i>';
    case 'basketball': return '<i class="bi bi-basket"></i>';
    case 'tennis': return '<i class="bi bi-emoji-sunglasses"></i>';
    case 'badminton': return '<i class="bi bi-wind"></i>';
    case 'volleyball': return '<i class="bi bi-emoji-laughing"></i>';
    case 'football': return '<i class="bi bi-emoji-neutral"></i>';
    case 'golf': return '<i class="bi bi-flag"></i>';
    case 'other': return '<i class="bi bi-activity"></i>';
    default: return '<i class="bi bi-activity"></i>';
  }
}

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString();
  }

  function bindShareButtons() {
    document.querySelectorAll('.share-btn').forEach(btn => {
      btn.onclick = function() {
        // 优先用 data-activity-id，否则用卡片标题，否则用 'activity'
        const activityId = this.closest('.activity-card')?.dataset?.activityId || this.closest('.activity-card')?.querySelector('h5')?.textContent || 'activity';
        window.openShareModal({ type: 'activity', id: activityId });
      };
    });
  }

  // 加载活动卡片
  loadRecentActivities();
  });

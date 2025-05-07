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
        } else {
          showError(result.message || 'Failed to upload file');
        }
      } catch (error) {
        console.error('Upload error:', error);
        showError('Failed to connect to server');
      }
    }
    
    // 清空文件输入
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
      
      const formData = {
        activityType: activityForm.querySelector('[name="activity_type"]').value,
        date: activityForm.querySelector('[name="date"]').value,
        duration: parseInt(activityForm.querySelector('[name="duration"]').value),
        distance: activityForm.querySelector('[name="distance"]').value ? parseFloat(activityForm.querySelector('[name="distance"]').value) : null,
        reps: activityForm.querySelector('[name="reps"]').value ? parseInt(activityForm.querySelector('[name="reps"]').value) : null,
        height: parseInt(activityForm.querySelector('[name="height"]').value),
        weight: parseInt(activityForm.querySelector('[name="weight"]').value),
        age: parseInt(activityForm.querySelector('[name="age"]').value),
        location: activityForm.querySelector('[name="location"]').value
      };
      
      console.log('Submitting activity data:', formData);  // 添加日志
      
      try {
        const response = await fetch('/analytics/api/activities/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        console.log('Server response:', result);  // 添加日志
        
        if (response.ok) {
          showSuccess(`Activity added successfully! Calories burned: ${result.calories}`);
          activityForm.reset();
          activityForm.querySelector('[name="date"]').valueAsDate = new Date();
        } else {
          showError(result.message || 'Failed to add activity');
        }
      } catch (error) {
        console.error('Error submitting activity:', error);  // 添加错误日志
        showError('Failed to connect to server');
      }
    });
  }

  // Handle activity type change
  if (activityTypeSelect && distanceGroup && repsGroup) {
    activityTypeSelect.addEventListener('change', () => {
      const selectedType = activityTypeSelect.value;
      
      if (['running', 'cycling', 'swimming', 'walking', 'hiking'].includes(selectedType)) {
        distanceGroup.style.display = 'block';
        repsGroup.style.display = 'none';
      } else if (['pushup', 'situp', 'pullup'].includes(selectedType)) {
        distanceGroup.style.display = 'none';
        repsGroup.style.display = 'block';
      } else {
        distanceGroup.style.display = 'none';
        repsGroup.style.display = 'none';
      }
    });
  }
});

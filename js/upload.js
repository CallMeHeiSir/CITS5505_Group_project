// 文件上传相关常量
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const VALID_TYPES = ['.csv', '.json', '.txt'];

// 获取DOM元素
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const fileList = document.getElementById('file-list');
const uploadForm = document.getElementById('upload-form');

// 文件验证函数
function validateFile(file) {
  // 检查文件大小
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds 5MB limit: ${file.name}`);
  }
  
  // 检查文件类型
  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  if (!VALID_TYPES.includes(ext)) {
    throw new Error(`Invalid file type: ${file.name}. Allowed types: ${VALID_TYPES.join(', ')}`);
  }
  
  return true;
}

// 创建文件预览元素
function createFilePreview(file) {
  const div = document.createElement('div');
  div.className = 'file-preview';
  
  // 添加文件信息
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
  
  // 添加预览按钮事件
  div.querySelector('.preview-btn').addEventListener('click', () => {
    previewFile(file);
  });
  
  // 添加删除按钮事件
  div.querySelector('.remove-btn').addEventListener('click', () => {
    div.remove();
    updateUploadButtonState();
  });
  
  return div;
}

// 文件预览功能
function previewFile(file) {
  if (file.type.startsWith('text')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      showPreviewModal(file.name, e.target.result);
    };
    reader.readAsText(file);
  }
}

// 显示预览模态框
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

// 更新上传按钮状态
function updateUploadButtonState() {
  const hasFiles = fileList.children.length > 0;
  const uploadButton = uploadForm.querySelector('button[type="submit"]');
  uploadButton.disabled = !hasFiles;
  uploadButton.classList.toggle('btn-disabled', !hasFiles);
}

// 处理文件拖放
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropZone.addEventListener(eventName, (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
});

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

// 处理文件选择
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

// 显示错误消息
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

// 文件拖放处理
dropZone.addEventListener('drop', (e) => {
  const files = e.dataTransfer.files;
  handleFiles(files);
});

// 文件输入处理
fileInput.addEventListener('change', (e) => {
  handleFiles(e.target.files);
});

// 表单提交处理
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
  
  // 模拟上传过程
  for (const file of files) {
    for (let i = 0; i <= 100; i += 10) {
      file.updateProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  // 模拟上传完成
  setTimeout(() => {
    fileList.innerHTML = '';
    updateUploadButtonState();
    showSuccess('Files uploaded successfully!');
  }, 500);
});

// 显示成功消息
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

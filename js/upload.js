const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');

// 拖拽高亮
['dragenter','dragover'].forEach(evt =>
  dropZone.addEventListener(evt, e => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  })
);
['dragleave','drop'].forEach(evt =>
  dropZone.addEventListener(evt, e => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
  })
);

// 放下文件
dropZone.addEventListener('drop', e => {
  fileInput.files = e.dataTransfer.files;
  // TODO: 调用上传 API
});

// 通过按钮选中文件
fileInput.addEventListener('change', () => {
  // TODO: 调用上传 API
});

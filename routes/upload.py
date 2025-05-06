from flask import Blueprint, request, jsonify
from config import Config
import os
import uuid

upload_bp = Blueprint('upload', __name__)

@upload_bp.route('/upload-avatar', methods=['POST'])
def upload_avatar():
    if 'avatar' not in request.files:
        return jsonify({'error': '未提供头像文件'}), 400

    file = request.files['avatar']
    if file.filename == '':
        return jsonify({'error': '未选择文件'}), 400

    if file and file.mimetype.startswith('image/'):
        filename = str(uuid.uuid4()) + os.path.splitext(file.filename)[1]
        file_path = os.path.join(Config.UPLOAD_FOLDER, filename)
        file.save(file_path)
        return jsonify({'message': '上传成功', 'avatar_path': f'/static/uploads/{filename}'}), 200
    else:
        return jsonify({'error': '仅支持图片文件'}), 400
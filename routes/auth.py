from flask import Blueprint, request, jsonify, session
from models.user import User
import re

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    phone = data.get('phone')
    gender = data.get('gender')
    birthdate = data.get('birthdate')
    address = data.get('address')
    avatar_path = data.get('avatar_path')

    if not all([username, email, password]):
        return jsonify({'error': '用户名、邮箱和密码为必填项'}), 400

    if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
        return jsonify({'error': '邮箱格式无效'}), 400

    special_char_regex = re.compile(r'[!@#$%^&*(),.?":{}|<>]')
    if len(password) < 6 or not special_char_regex.search(password):
        return jsonify({'error': '密码需至少6个字符并包含特殊字符'}), 400

    if User.create(username, email, password, phone, gender, birthdate, address, avatar_path):
        return jsonify({'message': '注册成功'}), 201
    else:
        return jsonify({'error': '用户名或邮箱已存在'}), 409

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({'error': '邮箱和密码为必填项'}), 400

    user = User.find_by_email(email)
    if not user or not User.verify_password(user['password_hash'], password):
        return jsonify({'error': '邮箱或密码无效'}), 401

    # 设置会话
    session['user_id'] = user['id']
    session['username'] = user['username']

    return jsonify({
        'message': '登录成功',
        'user': {
            'id': user['id'],
            'username': user['username'],
            'email': user['email'],
            'phone': user['phone'],
            'gender': user['gender'],
            'birthdate': user['birthdate'],
            'address': user['address'],
            'avatar_path': user['avatar_path']
        }
    }), 200

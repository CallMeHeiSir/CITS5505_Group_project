from flask import Blueprint, render_template, redirect, url_for, flash, request, current_app, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from extensions import db, mail
from flask_mail import Message
from sqlalchemy import select
from datetime import datetime
import os
import random
import string

auth = Blueprint('auth', __name__)

@auth.route('/send_verification_code', methods=['POST'])
def send_verification_code():
    from models.verification_code import VerificationCode
    
    email = request.form.get('email')
    code = ''.join(random.choices(string.digits, k=6))
    new_code = VerificationCode(email=email, code=code)
    db.session.add(new_code)
    db.session.commit()

    body_content = f"Your Verification Code is:{code}, Valid for 5 minutes."
    message = Message(subject="Your Verification Code", recipients=[email], body=body_content)
    mail.send(message)
    return redirect(url_for('auth.register'))

@auth.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        from models.user import User
        from models.verification_code import VerificationCode
        
        username = request.form.get('username')
        email = request.form.get('email')
        code = request.form.get('verificationCode')
        password = request.form.get('password')
        
        user = User.query.filter_by(username=username).first()
        
        if not user or user.email != email:
            flash('Invalid username or email', 'danger')
            return redirect(url_for('auth.login'))
        
        verificationCode = VerificationCode.query.filter_by(email=email).order_by(VerificationCode.created_at.desc()).first()
        if not verificationCode or verificationCode.code != code:
            flash('Invalid or expired verification code.', 'danger')
            return redirect(url_for('auth.login'))

        if verificationCode.is_expired():
            flash('Verification code has expired. Please request a new one.', 'danger')
            return redirect(url_for('auth.login'))
        
        if user and user.check_password(password):
            db.session.commit()
            login_user(user)
            return redirect(url_for('index'))
        else:
            flash('Invalid username or password', 'danger')
            return redirect(url_for('auth.login'))
    
    return render_template('login.html')

@auth.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out.', 'success')
    return redirect(url_for('welcome'))

@auth.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        from models.user import User
        from models.verification_code import VerificationCode
        
        username = request.form.get('username')
        email = request.form.get('email')
        code = request.form.get('verificationCode')
        password = request.form.get('password')
        phone = request.form.get('phone')
        gender = request.form.get('gender')
        birthdate = request.form.get('birthdate')
        address = request.form.get('address')
        avatar = request.files.get('avatar')
        avatar_filename = None
        
        if avatar and avatar.filename != '':
            avatar_filename = avatar.filename
            avatar_path = os.path.join(current_app.config['AVATAR_FOLDER'], avatar_filename)
            avatar.save(avatar_path)
        
        try:
            birthdate = datetime.strptime(birthdate, '%Y-%m-%d').date()
        except ValueError:
            flash('Invalid birthdate format. Please use YYYY-MM-DD.', 'danger')
            return redirect(url_for('auth.register'))
        
        verificationCode = VerificationCode.query.filter_by(email=email).order_by(VerificationCode.created_at.desc()).first()
        if not verificationCode or verificationCode.code != code:
            flash('Invalid or expired verification code.', 'danger')
            return redirect(url_for('auth.register'))

        if verificationCode.is_expired():
            flash('Verification code has expired. Please request a new one.', 'danger')
            return redirect(url_for('auth.register'))

        verificationCode.code = None
        
        stmt = select(User).where(User.username == username)
        if db.session.execute(stmt).scalar_one_or_none():
            flash('Username already exists', 'danger')
            return redirect(url_for('auth.register'))
        
        stmt = select(User).where(User.email == email)
        if db.session.execute(stmt).scalar_one_or_none():
            flash('Email already exists', 'danger')
            return redirect(url_for('auth.register'))
        
        user = User(
            username=username,
            email=email,
            phone=phone,
            gender=gender,
            birthdate=birthdate,
            address=address,
            avatar=avatar_filename,
            created_at=datetime.utcnow()
        )
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        
        flash('Registration successful', 'success')
        return redirect(url_for('auth.login'))
    
    return render_template('register.html')

@auth.route('/change_personal_information', methods=['POST'])
@login_required
def change_personal_information():
    from models.user import User  # 导入 User 模型

    username = request.form.get('username')
    email = request.form.get('email')
    phone = request.form.get('phone')
    gender = request.form.get('gender')
    birthdate = request.form.get('birthdate')
    address = request.form.get('address')

    try:
        birthdate = datetime.strptime(birthdate, '%Y-%m-%d').date()
    except ValueError:
        flash('Invalid birthdate format. Please use YYYY-MM-DD.', 'danger')
        return redirect(url_for('settings'))

    if User.query.filter_by(username=username).filter(User.id != current_user.id).first():
        flash('Username already exists', 'danger')
        return redirect(url_for('settings'))
    if User.query.filter_by(email=email).filter(User.id != current_user.id).first():
        flash('Email already exists', 'danger')
        return redirect(url_for('settings'))

    current_user.username = username
    current_user.email = email
    current_user.phone = phone
    current_user.gender = gender
    current_user.birthdate = birthdate
    current_user.address = address

    db.session.commit()
    flash('Information updated successfully!', 'success')
    return redirect(url_for('settings'))

@auth.route('/change_password', methods=['GET', 'POST'])
@login_required
def change_password():
    if request.method == 'POST':
        current_password = request.form.get('current_password')
        new_password = request.form.get('new_password')
        confirm_password = request.form.get('confirm_new_password')
        
        if not all([current_password, new_password, confirm_password]):
            flash('All fields are required', 'danger')
            return redirect(url_for('auth.change_password'))

        if not current_user.check_password(current_password):
            flash('Current password is incorrect', 'danger')
            return redirect(url_for('auth.change_password'))

        if new_password != confirm_password:
            flash('New passwords do not match', 'danger')
            return redirect(url_for('auth.change_password'))

        current_user.set_password(new_password)
        db.session.commit()
        flash('Password changed successfully!', 'success')
        return redirect(url_for('auth.login'))

    return render_template('change_password.html')

@auth.route('/retrieve_password', methods=['GET', 'POST'])
def retrieve_password():
    if request.method == 'POST':
        from models.user import User
        
        username = request.form.get('username')
        email = request.form.get('email')
        new_password = request.form.get('new_password')
        confirm_password = request.form.get('confirm_new_password')

        user = User.query.filter_by(username=username).first()
        if not user or user.email != email:
            flash('Invalid username or email', 'danger')
            return redirect(url_for('auth.retrieve_password'))

        if new_password != confirm_password:
            flash('New passwords do not match', 'danger')
            return redirect(url_for('auth.retrieve_password'))

        user.set_password(new_password)
        db.session.commit()
        flash('Password retrieved successfully!', 'success')
        return redirect(url_for('auth.login'))

    return render_template('retrieve_password.html')

@auth.route('/update_avatar', methods=['POST'])
@login_required
def update_avatar():
    avatar = request.files.get('avatar')
    if not avatar or not avatar.filename:
        flash('No file uploaded or invalid file.', 'danger')
        return jsonify({'success': False, 'message': 'No file uploaded or invalid file'}), 400

    if current_user.avatar:
        old_avatar_path = os.path.join(current_app.config['AVATAR_FOLDER'], current_user.avatar)
        if os.path.exists(old_avatar_path):
            try:
                os.remove(old_avatar_path)
            except OSError as e:
                flash(f'Failed to delete old avatar: {str(e)}', 'danger')
                return jsonify({'success': False, 'message': f'Failed to delete old avatar: {str(e)}'}), 500

    try:
        avatar_filename = avatar.filename
        avatar_path = os.path.join(current_app.config['AVATAR_FOLDER'], avatar_filename)
        avatar.save(avatar_path)
    except Exception as e:
        flash(f'Failed to save avatar: {str(e)}', 'danger')
        return jsonify({'success': False, 'message': f'Failed to save avatar: {str(e)}'}), 500

    current_user.avatar = avatar_filename
    db.session.commit()

    flash('Avatar updated successfully!', 'success')
    avatar_url = url_for('static', filename='avatars/' + avatar_filename)
    return jsonify({'success': True, 'avatar_url': avatar_url})
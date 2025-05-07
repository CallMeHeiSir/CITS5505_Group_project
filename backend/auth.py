from flask import Blueprint, render_template, redirect, url_for, flash, request, current_app
from flask_login import login_user, logout_user, login_required, current_user
from extensions import db
from sqlalchemy import select
from datetime import datetime  # 用于处理日期和时间
import os  # 用于操作文件路径

auth = Blueprint('auth', __name__)

@auth.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        from models.user import User
        username = request.form.get('username')
        password = request.form.get('password')
        user = User.query.filter_by(username=username).first()
        
        if user and user.check_password(password):
           login_user(user)
           flash('Login successful!', 'success')  # 添加成功提示
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
    return redirect(url_for('welcome'))  # 注销后跳转到 welcome 页面

@auth.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        from models.user import User
        username = request.form.get('username')
        email = request.form.get('email')
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
        
        # 将 birthdate 转换为 datetime.date 对象
        try:
            birthdate = datetime.strptime(birthdate, '%Y-%m-%d').date()
        except ValueError:
            flash('Invalid birthdate format. Please use YYYY-MM-DD.', 'danger')
            return redirect(url_for('auth.register'))
        
        # 检查用户名是否已存在
        stmt = select(User).where(User.username == username)
        if db.session.execute(stmt).scalar_one_or_none():
            flash('Username already exists', 'danger')
            return redirect(url_for('auth.register'))
        
        # 检查邮箱是否已存在
        stmt = select(User).where(User.email == email)
        if db.session.execute(stmt).scalar_one_or_none():
            flash('Email already exists', 'danger')
            return redirect(url_for('auth.register'))
        
        user = User(username=username, email=email,phone=phone,gender=gender,birthdate=birthdate,address=address,avatar=avatar_filename)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        
        flash('Registration successful', 'success')
        return redirect(url_for('auth.login'))
    
    return render_template('register.html') 

@auth.route('/change_personal_information', methods=['GET', 'POST'])
def change_personal_information():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        phone = request.form.get('phone')
        gender = request.form.get('gender')
        birthdate = request.form.get('birthdate')
        address = request.form.get('address')
        avatar = request.files.get('avatar')

        # 将 birthdate 转换为 datetime.date 对象
        try:
            birthdate = datetime.strptime(birthdate, '%Y-%m-%d').date()
        except ValueError:
            flash('Invalid birthdate format. Please use YYYY-MM-DD.', 'danger')
            return redirect(url_for('auth.change_personal_information'))

        # 更新用户信息
        current_user.username = username
        current_user.email = email
        current_user.phone = phone
        current_user.gender = gender
        current_user.birthdate = birthdate
        current_user.address = address

        if avatar:
            avatar_filename = avatar.filename
            avatar_path = os.path.join(current_app.config['AVATAR_FOLDER'], avatar_filename)
            avatar.save(avatar_path)
            current_user.avatar = avatar_filename

        db.session.commit()
        flash('Information updated successfully!', 'success')
        return redirect(url_for('settings'))

    return render_template('change_personal_information.html', user=current_user)

@auth.route('/change_password', methods=['GET', 'POST'])
def change_password():
    if request.method == 'POST':
        current_password = request.form.get('current_password')
        new_password = request.form.get('new_password')
        confirm_password = request.form.get('confirm_password')

        if not current_user.check_password(current_password):
            flash('Current password is incorrect', 'danger')
            return redirect(url_for('auth.change_password'))

        if new_password != confirm_password:
            flash('New passwords do not match', 'danger')
            return redirect(url_for('auth.change_password'))

        current_user.set_password(new_password)
        db.session.commit()
        flash('Password changed successfully!', 'success')
        return redirect(url_for('settings'))

    return render_template('change_password.html')
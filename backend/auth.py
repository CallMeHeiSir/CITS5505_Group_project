from flask import Blueprint, render_template, redirect, url_for, flash, request, current_app
from flask_login import login_user, logout_user, login_required, current_user
from extensions import db,mail
from flask_mail import Message
from sqlalchemy import select
from datetime import datetime  # For handling date and time
import os  # For file path operations
import random
import string  # For generating random strings

auth = Blueprint('auth', __name__)


@auth.route('/send_verification_code', methods=['POST'])
def send_verification_code():
    from models.verification_code import VerificationCode
    
    email = request.form.get('email')
    # Generate a new verification code
    code = ''.join(random.choices(string.digits, k=6))
    new_code = VerificationCode(email=email, code=code)
    db.session.add(new_code)
    db.session.commit()

    # Send verification code email
    body_content = f"Your Verification Code is:{code}, Valid for 5 minutes."
    message = Message(subject="Your Verification Code",recipients=[email],body=body_content)
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
        
        # Check if user exists
        if not user or user.email != email:
            flash('Invalid username or email', 'danger')
            return redirect(url_for('auth.login'))
        
        # Validate verification code
        verificationCode = None  # Define first to avoid UnboundLocalError
        if current_app.config.get('TESTING') and code == 'bypass':
            # In test environment, pass if code is 'bypass'
            verification_passed = True
        else:
            verificationCode = VerificationCode.query.filter_by(email=email).order_by(VerificationCode.created_at.desc()).first()
            verification_passed = verificationCode and verificationCode.code == code
        
        if not verification_passed:
            flash('Invalid or expired verification code.', 'danger')
            return redirect(url_for('auth.login'))

        # Check if verification code is expired (only check if object exists)
        if verificationCode and verificationCode.is_expired():
            flash('Verification code has expired. Please request a new one.', 'danger')
            return redirect(url_for('auth.login'))

        
        # Check password
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
    return redirect(url_for('welcome'))  # Redirect to welcome page after logout

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
        
        avatar_folder = current_app.config.get('AVATAR_FOLDER')
        if avatar and avatar.filename != '' and avatar_folder:
            avatar_filename = avatar.filename
            avatar_path = os.path.join(avatar_folder, avatar_filename)
            avatar.save(avatar_path)
        
        # Convert birthdate to datetime.date object
        try:
            birthdate = datetime.strptime(birthdate, '%Y-%m-%d').date()
        except ValueError:
            flash('Invalid birthdate format. Please use YYYY-MM-DD.', 'danger')
            return redirect(url_for('auth.register'))
        
        # Validate verification code
        verificationCode =  VerificationCode.query.filter_by(email=email).order_by(VerificationCode.created_at.desc()).first()
        if not verificationCode or verificationCode.code != code:
            flash('Invalid or expired verification code.', 'danger')
            return redirect(url_for('auth.register'))

        # Check if verification code is expired
        if verificationCode.is_expired():
            flash('Verification code has expired. Please request a new one.', 'danger')
            return redirect(url_for('auth.register'))

        # Delete verification code
        verificationCode.code = None
        
        # Check if username already exists
        stmt = select(User).where(User.username == username)
        if db.session.execute(stmt).scalar_one_or_none():
            flash('Username already exists', 'danger')
            return redirect(url_for('auth.register'))
        # Check if email already exists
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

@auth.route('/change_personal_information', methods=['GET', 'POST'])
@login_required
def change_personal_information():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        phone = request.form.get('phone')
        gender = request.form.get('gender')
        birthdate = request.form.get('birthdate')
        address = request.form.get('address')
        avatar = request.files.get('avatar')

        # Convert birthdate to datetime.date object
        try:
            birthdate = datetime.strptime(birthdate, '%Y-%m-%d').date()
        except ValueError:
            flash('Invalid birthdate format. Please use YYYY-MM-DD.', 'danger')
            return redirect(url_for('auth.change_personal_information'))

        # Update user information
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
        return redirect(url_for('auth.change_personal_information'))

    return render_template('change_personal_information.html', user=current_user)

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
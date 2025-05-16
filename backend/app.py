from flask import Flask, render_template, redirect, url_for, request, jsonify, flash
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from extensions import db, login_manager, mail
from sqlalchemy.orm import DeclarativeBase
from flask_wtf.csrf import CSRFProtect
from forms import ActivityForm
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
from datetime import datetime
import os
import requests
from models.check_in_log import CheckInLog
from checkin import checkin_bp

# Load environment variables
load_dotenv()

# Create base model class
class Base(DeclarativeBase):
    pass

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///app.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['AVATAR_FOLDER'] = os.getenv('AVATAR_FOLDER', 'static/avatars/')
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Limit upload file size to 16MB
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
    app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True').lower() in ['true', '1', 'yes']
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')
    
    # Automatically create avatar folder
    if not os.path.exists(app.config['AVATAR_FOLDER']):
        os.makedirs(app.config['AVATAR_FOLDER'], exist_ok=True)
    
    # Initialize extensions
    db.init_app(app)
    mail.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    
    # Enable CSRF protection
    csrf = CSRFProtect()
    csrf.init_app(app)
    
    # Exempt specific routes from CSRF protection
    csrf.exempt('friend.send_friend_request')
    csrf.exempt('friend.handle_friend_request')
    csrf.exempt('checkin.daily_checkin')
    csrf.exempt('share.share_activity')
    csrf.exempt('share.revoke_share')

    
    
    with app.app_context():
        # Import models
        from models.user import User
        from models.activity_log import ActivityLog
        from models.verification_code import VerificationCode
        from models.friend import FriendRequest, Friendship
        
        # Create database tables
        db.create_all()
        
        # Register blueprints
        from auth import auth as auth_blueprint
        from analytics import analytics as analytics_blueprint
        from visualization import visualization as visualization_blueprint
        from activity_records import activity_records as activity_records_blueprint
        from friend import friend_bp
        from share import share_bp
        app.register_blueprint(auth_blueprint, url_prefix='/auth')
        app.register_blueprint(analytics_blueprint, url_prefix='/analytics')
        app.register_blueprint(visualization_blueprint, url_prefix='/api/visualization')
        app.register_blueprint(activity_records_blueprint)
        app.register_blueprint(friend_bp, url_prefix='/api/friend')
        app.register_blueprint(share_bp)
        app.register_blueprint(checkin_bp)

        
        # Page routes
        @app.route('/')
        def home():
            return redirect(url_for('welcome'))
        
        @app.route('/welcome')
        def welcome():
            return render_template('welcome.html')
        
        @app.route('/index')
        def index():
            return render_template('index.html')
        
        @app.route('/upload')
        def upload():
            form = ActivityForm()
            return render_template('upload.html', form=form)
        
        @app.route('/visualize')
        def visualize():
            return render_template('visualize.html')
        
        @app.route('/profile')
        def profile():
            return render_template('profile.html')
        
        @app.route('/register')
        def register():
            return redirect(url_for('auth.register'))
        
        @app.route('/login')
        def login():
            return redirect(url_for('auth.login'))
        
        @app.route('/settings')
        def settings():
            return render_template('settings.html')
        
        @app.route('/new_issue')
        def new_issue():
            return render_template('new_issue.html')
        
        @app.route('/new_challenge')
        def new_challenge():
            return render_template('new_challenge.html')
        
        @app.route('/new_friend')
        def new_friend():
            return render_template('new_friend.html')
        
        @app.route('/leaderboard')
        def leaderboard():
            return render_template('leaderboard.html')
        
        @app.route('/issue')
        def issue():
            return render_template('issue.html')
        
        @app.route('/issue_detail')
        def issue_detail():
            return render_template('issue_detail.html')
        
        @app.route('/friends')
        def friends():
            return render_template('friends.html')
        
        @app.route('/forum')
        def forum():
            return render_template('forum copy.html')
        
        @app.route('/challenge_detail')
        def challenge_detail():
            return render_template('challenge_detail.html')
        
        @app.route('/challenge')
        def challenge():
            return render_template('challenge.html')
        
        @app.route('/share')
        def share():
            return render_template('share.html')
        
        @app.route('/weather/<lat>/<lon>/<city>')
        def get_weather(lat, lon, city):
            url = f'https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true'
            try:
                response = requests.get(url)
                response.raise_for_status()
                return jsonify(response.json())
            except requests.RequestException as e:
                app.logger.error(f'Weather API error: {str(e)}')
                return jsonify({'error': 'Unable to fetch weather data'}), 500
        
        @app.route('/update_profile', methods=['POST'])
        @login_required
        def update_profile():
            try:
                user = current_user
                # Check for email uniqueness
                email = request.form.get('email')
                existing_user = User.query.filter_by(email=email).first()
                if existing_user and existing_user.id != user.id:
                    return jsonify({'success': False, 'message': 'Email already exists'}), 400
                
                # Check for username uniqueness
                username = request.form.get('username')
                existing_user = User.query.filter_by(username=username).first()
                if existing_user and existing_user.id != user.id:
                    return jsonify({'success': False, 'message': 'Username already exists'}), 400
                
                # Update fields
                user.username = username
                user.email = email
                user.phone = request.form.get('phone')
                user.gender = request.form.get('gender')
                birthdate = request.form.get('birthdate')
                if birthdate:
                    try:
                        user.birthdate = datetime.strptime(birthdate, '%Y-%m-%d').date()
                    except ValueError:
                        return jsonify({'success': False, 'message': 'Invalid birthdate format'}), 400
                user.address = request.form.get('address')

                # Handle avatar upload
                if 'avatar' in request.files:
                    file = request.files['avatar']
                    if file and file.filename:
                        filename = secure_filename(file.filename)
                        file.save(os.path.join(app.config['AVATAR_FOLDER'], filename))
                        user.avatar = filename

                db.session.commit()
                flash('Profile updated successfully!', 'success')
                return jsonify({'success': True})
            except Exception as e:
                db.session.rollback()
                app.logger.error(f'Profile update error: {str(e)}')
                return jsonify({'success': False, 'message': str(e)}), 500

        @app.route('/update_bio', methods=['POST'])
        @login_required
        def update_bio():
            try:
                bio = request.form.get('bio')
                current_user.bio = bio
                db.session.commit()
                flash('Bio updated successfully!', 'success')
                return jsonify({'success': True})
            except Exception as e:
                db.session.rollback()
                app.logger.error(f'Bio update error: {str(e)}')
                return jsonify({'success': False, 'message': str(e)}), 500
        
        @login_manager.user_loader
        def load_user(user_id):
            return db.session.get(User, int(user_id))
    
    return app

if __name__ == '__main__':
    app = create_app()
    print(app.url_map)
    app.run(debug=True) 
from flask import Flask, render_template, redirect, url_for, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from extensions import db, login_manager, mail
from sqlalchemy.orm import DeclarativeBase
from flask_login import login_required, current_user
from flask_migrate import Migrate
import os
from share import share_bp
from friendship import friendship_bp
from datetime import datetime
from auth import auth as auth_blueprint
from analytics import analytics as analytics_blueprint
from visualization import visualization as visualization_blueprint
from activity_records import activity_records as activity_records_blueprint
from share import share_bp

# Load environment variables
load_dotenv()

# Create base model class
class Base(DeclarativeBase):
    pass

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///fitness.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['AVATAR_FOLDER'] = os.getenv('AVATAR_FOLDER', 'static/avatars/')
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Limit upload file size to 16MB

    # Email configuration from environment variables
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
    migrate = Migrate(app, db)
    mail.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    
    with app.app_context():
        # Import models
        from models.user import User
        from models.activity_log import ActivityLog
        from models.verification_code import VerificationCode
        from models.share import Share
        
        # Create database tables
        db.create_all()
        
        # Register blueprints
        app.register_blueprint(auth_blueprint, url_prefix='/auth')
        app.register_blueprint(analytics_blueprint, url_prefix='/analytics')
        app.register_blueprint(visualization_blueprint, url_prefix='/api/visualization')
        app.register_blueprint(activity_records_blueprint)
        app.register_blueprint(share_bp, url_prefix='/api')
        app.register_blueprint(friendship_bp)
        
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
            return render_template('upload.html')

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

        @app.route('/new_friend')
        @login_required
        def new_friend():
            return render_template('new_friend.html')

        @app.route('/friends')
        @login_required
        def friends():
            return render_template('new_friend.html')

        @app.route('/forum')
        def forum():
            return redirect(url_for('share'))

        @app.route('/share')
        @login_required
        def share():
            return render_template('share.html')
        
        @app.route('/api/shares/available-charts')
        @login_required
        def get_available_charts():
            return jsonify({
                'success': True,
                'charts': [
                    {'id': 'total-stats', 'title': 'Total Statistics'},
                    {'id': 'activity-calendar', 'title': 'Activity Calendar'},
                    {'id': 'calories-prediction', 'title': 'Calories Prediction'},
                    {'id': 'activity-duration', 'title': 'Activity Duration by Day'},
                    {'id': 'distance-progress', 'title': 'Distance Progress'},
                    {'id': 'activity-distribution', 'title': 'Activity Distribution'},
                    {'id': 'calories-trend', 'title': 'Calories Trend'},
                    {'id': 'dashboard', 'title': 'Complete Dashboard'}
                ]
            })

        @app.route('/api/shares', methods=['POST'])
        @login_required
        def create_share():
            data = request.json
            if not data or 'chartType' not in data or 'friendId' not in data:
                return jsonify({'success': False, 'error': 'Invalid request data'}), 400

            try:
                # Save share data to database
                new_share = Share(
                    from_user_id=current_user.id,
                    to_user_id=data['friendId'],
                    chart_type=data['chartType'],
                    chart_data=data['data'],
                    created_at=datetime.utcnow()
                )
                db.session.add(new_share)
                db.session.commit()

                return jsonify({'success': True, 'message': 'Share created successfully'})
            except Exception as e:
                db.session.rollback()
                return jsonify({'success': False, 'error': str(e)}), 500

        @app.route('/api/shares/received')
        @login_required
        def get_received_shares():
            try:
                shares = Share.query.filter_by(to_user_id=current_user.id).order_by(Share.created_at.desc()).all()
                return jsonify({
                    'success': True,
                    'shares': [{
                        'id': share.id,
                        'chartId': share.id,
                        'chartType': share.chart_type,
                        'chartTitle': CHART_TYPES.get(share.chart_type, 'Unknown Chart'),
                        'fromUser': User.query.get(share.from_user_id).username,
                        'time': share.created_at.isoformat(),
                        'data': share.chart_data
                    } for share in shares]
                })
            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        @app.route('/api/shares/sent')
        @login_required
        def get_sent_shares():
            try:
                shares = Share.query.filter_by(from_user_id=current_user.id).order_by(Share.created_at.desc()).all()
                return jsonify({
                    'success': True,
                    'shares': [{
                        'id': share.id,
                        'chartId': share.id,
                        'chartType': share.chart_type,
                        'chartTitle': CHART_TYPES.get(share.chart_type, 'Unknown Chart'),
                        'toUser': User.query.get(share.to_user_id).username,
                        'time': share.created_at.isoformat(),
                        'data': share.chart_data
                    } for share in shares]
                })
            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        @app.route('/api/shares/<int:share_id>', methods=['DELETE'])
        @login_required
        def delete_share(share_id):
            try:
                share = Share.query.get(share_id)
                if not share or share.from_user_id != current_user.id:
                    return jsonify({'success': False, 'error': 'Share not found'}), 404

                db.session.delete(share)
                db.session.commit()
                return jsonify({'success': True, 'message': 'Share deleted successfully'})
            except Exception as e:
                db.session.rollback()
                return jsonify({'success': False, 'error': str(e)}), 500

        @login_manager.user_loader
        def load_user(user_id):
            return User.query.get(int(user_id))
    
    return app

if __name__ == '__main__':
    app = create_app()
    print(app.url_map)  # Print all registered routes
    app.run(debug=True) 
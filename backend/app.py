from flask import Flask, render_template, redirect, url_for, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from extensions import db, login_manager, mail
from sqlalchemy.orm import DeclarativeBase
from flask_login import login_required
import os

# 加载环境变量
load_dotenv()

# 创建基础模型类
class Base(DeclarativeBase):
    pass



def create_app():
    app = Flask(__name__)
    
    # 配置
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///app.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['AVATAR_FOLDER'] = os.getenv('AVATAR_FOLDER', 'static/avatars/')
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 限制上传文件大小为16MB
 # 邮件配置从环境变量加载
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
    app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True').lower() in ['true', '1', 'yes']
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')
    
    
    # 自动创建头像文件夹
    if not os.path.exists(app.config['AVATAR_FOLDER']):
        os.makedirs(app.config['AVATAR_FOLDER'], exist_ok=True)
    
    # 初始化扩展
    db.init_app(app)
    mail.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    
    
    
    with app.app_context():
        # 导入模型
        from models.user import User
        from models.activity_log import ActivityLog
        from models.verification_code import VerificationCode
        
        # 创建数据库表
        db.create_all()
        
        # 注册蓝图
        from auth import auth as auth_blueprint
        from analytics import analytics as analytics_blueprint
        from visualization import visualization as visualization_blueprint
        from activity_records import activity_records as activity_records_blueprint
        app.register_blueprint(auth_blueprint, url_prefix='/auth')
        app.register_blueprint(analytics_blueprint, url_prefix='/analytics')
        app.register_blueprint(visualization_blueprint, url_prefix='/api/visualization')
        app.register_blueprint(activity_records_blueprint)
        
        # 添加页面路由
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
        @app.route('/settings')
        @login_required
        def settings():
            return render_template('settings.html')
        @login_manager.user_loader
        def load_user(user_id):
            return db.session.get(User, int(user_id))
    
    return app

if __name__ == '__main__':
    app = create_app()
    print(app.url_map)
    app.run(debug=True) 
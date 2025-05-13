from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_mail import Mail
from flask_migrate import Migrate
from flask_cors import CORS
from .config import Config

# Initialize extensions
db = SQLAlchemy()
login_manager = LoginManager()
mail = Mail()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    
    # Load config
    app.config.from_object(Config)
    
    # Initialize extensions
    db.init_app(app)
    login_manager.init_app(app)
    mail.init_app(app)
    migrate.init_app(app, db)
    CORS(app)
    
    # Set login view
    login_manager.login_view = 'auth.login'
    
    # Register blueprints
    from auth import auth as auth_blueprint
    from analytics import analytics as analytics_blueprint
    from visualization import visualization as visualization_blueprint
    from activity_records import activity_records as activity_records_blueprint
    from share import share_bp
    from friendship import friendship_bp
    
    app.register_blueprint(auth_blueprint, url_prefix='/auth')
    app.register_blueprint(analytics_blueprint, url_prefix='/analytics')
    app.register_blueprint(visualization_blueprint, url_prefix='/api/visualization')
    app.register_blueprint(activity_records_blueprint)
    app.register_blueprint(share_bp, url_prefix='/api')
    app.register_blueprint(friendship_bp)
    
    print(app.url_map)  # 打印所有路由，方便调试

    return app 
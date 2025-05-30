from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from .config import Config

db = SQLAlchemy()
login_manager = LoginManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'

    from .auth import auth as auth_blueprint
    from .main import main as main_blueprint
    from .analytics import analytics as analytics_blueprint
    from .visualization import visualization as visualization_blueprint
    from .share import share_bp  # Import the share blueprint

    app.register_blueprint(auth_blueprint)
    app.register_blueprint(main_blueprint)
    app.register_blueprint(analytics_blueprint, url_prefix='/analytics')
    app.register_blueprint(visualization_blueprint, url_prefix='/api/visualization')
    app.register_blueprint(share_bp, url_prefix='/api')  # Register the share blueprint

    print(app.url_map)  # Print all routes for debugging

    return app
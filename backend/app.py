from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from dotenv import load_dotenv
from sqlalchemy.orm import DeclarativeBase
import os

# 加载环境变量
load_dotenv()

# 创建基础模型类
class Base(DeclarativeBase):
    pass

# 初始化扩展
db = SQLAlchemy(model_class=Base)
login_manager = LoginManager()

def create_app():
    app = Flask(__name__)
    
    # 配置
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///app.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # 初始化扩展
    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    
    with app.app_context():
        # 导入模型
        from models.user import User
        
        # 创建数据库表
        db.create_all()
        
        # 注册蓝图
        from auth import auth as auth_blueprint
        app.register_blueprint(auth_blueprint, url_prefix='/auth')
        
        # 添加一个测试路由
        @app.route('/')
        def index():
            return 'Hello, World!'
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True) 
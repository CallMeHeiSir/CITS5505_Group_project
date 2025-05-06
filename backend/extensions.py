from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager

# 定义扩展实例
db = SQLAlchemy()
login_manager = LoginManager()
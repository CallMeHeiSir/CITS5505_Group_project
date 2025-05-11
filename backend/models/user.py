from datetime import datetime, timedelta
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import String, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from extensions import db, login_manager

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), unique=True,nullable=True)
    gender = db.Column(db.String(10), nullable=True)
    birthdate = db.Column(db.Date, nullable=True)
    address = db.Column(db.String(200), nullable=True)
    avatar = db.Column(db.String(200), nullable=True)
    password_hash = db.Column(db.String(128))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    failed_attempts = db.Column(db.Integer, default=0)  # 登录失败次数
    lock_until = db.Column(db.DateTime, nullable=True)  # 锁定截止时间
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    
    
@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id)) 
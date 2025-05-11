from extensions import db
from datetime import datetime, timedelta

class VerificationCode(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), nullable=False)
    code = db.Column(db.String(6), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def is_expired(self):
        """检查验证码是否过期（有效期为5分钟）"""
        return datetime.utcnow() > self.created_at + timedelta(minutes=5)
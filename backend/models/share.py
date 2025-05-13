from datetime import datetime
from extensions import db

class Share(db.Model):
    __tablename__ = 'shares'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    chart_id = db.Column(db.String(100), nullable=False)
    chart_title = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 关系
    user = db.relationship('User', backref=db.backref('shares', lazy=True))
    recipients = db.relationship('ShareRecipient', backref='share', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'chart_id': self.chart_id,
            'chart_title': self.chart_title,
            'created_at': self.created_at.isoformat(),
            'isOwner': True  # 在API层面会根据当前用户动态设置这个值
        }

class ShareRecipient(db.Model):
    __tablename__ = 'share_recipients'
    
    id = db.Column(db.Integer, primary_key=True)
    share_id = db.Column(db.Integer, db.ForeignKey('shares.id'), nullable=False)
    recipient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, accepted, rejected
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 关系
    recipient = db.relationship('User', backref=db.backref('received_shares', lazy=True))
    
    __table_args__ = (
        db.UniqueConstraint('share_id', 'recipient_id', name='unique_share_recipient'),
    ) 
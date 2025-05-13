from datetime import datetime
from extensions import db

class Share(db.Model):
    __tablename__ = 'shares'
    
    id = db.Column(db.Integer, primary_key=True)
    from_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    to_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    chart_type = db.Column(db.String(50), nullable=False)
    chart_data = db.Column(db.JSON, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    # 关系
    from_user = db.relationship('User', foreign_keys=[from_user_id], backref='shares_sent')
    to_user = db.relationship('User', foreign_keys=[to_user_id], backref='shares_received')
    
    def __init__(self, from_user_id, to_user_id, chart_type, chart_data, created_at=None):
        self.from_user_id = from_user_id
        self.to_user_id = to_user_id
        self.chart_type = chart_type
        self.chart_data = chart_data
        self.created_at = created_at or datetime.utcnow()

    def to_dict(self):
        return {
            'id': self.id,
            'from_user_id': self.from_user_id,
            'to_user_id': self.to_user_id,
            'chart_type': self.chart_type,
            'chart_data': self.chart_data,
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
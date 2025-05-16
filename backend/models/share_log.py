from app import db
from datetime import datetime

class ShareLog(db.Model):
    __tablename__ = 'share_log'
    id = db.Column(db.Integer, primary_key=True)
    from_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # Initiator
    to_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)    # Recipient
    activity_log_id = db.Column(db.Integer, db.ForeignKey('activity_log.id'), nullable=True)  # Associated activity record
    share_type = db.Column(db.String(32), default='activity')  # Share type
    snapshot = db.Column(db.Text, nullable=True)               # Parameter snapshot (JSON string)
    share_message = db.Column(db.Text, nullable=True)          # Message
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # Share time
    status = db.Column(db.String(16), default='active')        # Status (active/revoked/...)

    from_user = db.relationship('User', foreign_keys=[from_user_id])
    to_user = db.relationship('User', foreign_keys=[to_user_id])
    activity_log = db.relationship('ActivityLog', foreign_keys=[activity_log_id])
from app import db
from datetime import datetime

class ShareLog(db.Model):
    __tablename__ = 'share_log'
    id = db.Column(db.Integer, primary_key=True)
    from_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # 发起人
    to_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)    # 接收人
    activity_log_id = db.Column(db.Integer, db.ForeignKey('activity_log.id'), nullable=True)  # 关联的运动记录
    share_type = db.Column(db.String(32), default='activity')  # 分享类型
    snapshot = db.Column(db.Text, nullable=True)               # 参数快照（JSON字符串）
    share_message = db.Column(db.Text, nullable=True)          # 留言
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # 分享时间
    status = db.Column(db.String(16), default='active')        # 状态（active/revoked/…）

    from_user = db.relationship('User', foreign_keys=[from_user_id])
    to_user = db.relationship('User', foreign_keys=[to_user_id])
    activity_log = db.relationship('ActivityLog', foreign_keys=[activity_log_id]) 
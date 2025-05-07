from app import db
from datetime import datetime

class ActivityLog(db.Model):
    __tablename__ = 'activity_log'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    activity_type = db.Column(db.String(50), nullable=False)
    date = db.Column(db.Date, nullable=False)
    duration = db.Column(db.Integer)
    distance = db.Column(db.Float)
    reps = db.Column(db.Integer)
    calories = db.Column(db.Integer)
    height = db.Column(db.Integer)
    weight = db.Column(db.Integer)
    age = db.Column(db.Integer)
    location = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow) 
from datetime import datetime
from extensions import db
from models.user import User  # Import User model

class FriendRequest(db.Model):
    __tablename__ = 'friend_requests'
    
    id = db.Column(db.Integer, primary_key=True)
    from_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    to_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    status = db.Column(db.String(20), default='pending')  # Status options: pending, accepted, rejected
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    from_user = db.relationship('User', foreign_keys=[from_user_id], backref=db.backref('sent_requests', lazy='dynamic'))
    to_user = db.relationship('User', foreign_keys=[to_user_id], backref=db.backref('received_requests', lazy='dynamic'))

class Friendship(db.Model):
    __tablename__ = 'friendships'

    id = db.Column(db.Integer, primary_key=True)
    user1_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user2_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user1 = db.relationship('User', foreign_keys=[user1_id], backref=db.backref('friendships1', lazy='dynamic'))
    user2 = db.relationship('User', foreign_keys=[user2_id], backref=db.backref('friendships2', lazy='dynamic'))

    @staticmethod
    def are_friends(user_id_1, user_id_2):
        from sqlalchemy import or_, and_
        return db.session.query(Friendship).filter(
            or_(
                and_(Friendship.user1_id == user_id_1, Friendship.user2_id == user_id_2),
                and_(Friendship.user1_id == user_id_2, Friendship.user2_id == user_id_1)
            )
        ).first() is not None

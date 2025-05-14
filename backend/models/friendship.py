from extensions import db
from datetime import datetime

class Friendship(db.Model):
    __tablename__ = 'friendships'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    friend_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='pending')  # pending, accepted, rejected
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', foreign_keys=[user_id], backref=db.backref('friendships_initiated', lazy='dynamic'))
    friend = db.relationship('User', foreign_keys=[friend_id], backref=db.backref('friendships_received', lazy='dynamic'))
    
    def __init__(self, user_id, friend_id, status='pending'):
        self.user_id = user_id
        self.friend_id = friend_id
        self.status = status
    
    @staticmethod
    def are_friends(user_id, friend_id):
        """Check if two users are friends"""
        return Friendship.query.filter(
            ((Friendship.user_id == user_id) & (Friendship.friend_id == friend_id) |
             (Friendship.user_id == friend_id) & (Friendship.friend_id == user_id)) &
            (Friendship.status == 'accepted')
        ).first() is not None
    
    @staticmethod
    def get_friends(user_id):
        """Get all friends of a user"""
        # Get friendships where user is either the initiator or receiver
        friendships = Friendship.query.filter(
            ((Friendship.user_id == user_id) | (Friendship.friend_id == user_id)) &
            (Friendship.status == 'accepted')
        ).all()
        
        friends = []
        for friendship in friendships:
            # If user is the initiator, get the friend
            if friendship.user_id == user_id:
                friends.append(friendship.friend)
            # If user is the receiver, get the user
            else:
                friends.append(friendship.user)
        
        return friends 
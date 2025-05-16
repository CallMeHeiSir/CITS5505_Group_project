from flask import Blueprint, jsonify, request, current_app
from flask_login import current_user, login_required
from models.friend import FriendRequest, Friendship
from models.user import User
from extensions import db
from sqlalchemy import or_, and_

friend_bp = Blueprint('friend', __name__)

@friend_bp.route('/send_request', methods=['POST'])
@login_required
def send_friend_request():
    data = request.get_json()
    to_user_id = data.get('to_user_id')
    
    # Check if request already exists
    existing_request = FriendRequest.query.filter_by(
        from_user_id=current_user.id,
        to_user_id=to_user_id,
        status='pending'
    ).first()
    
    if existing_request:
        return jsonify({'message': 'Friend request already sent'}), 400
    
    # Check if they are already friends
    existing_friendship = Friendship.query.filter(
        or_(
            and_(Friendship.user1_id == current_user.id, Friendship.user2_id == to_user_id),
            and_(Friendship.user1_id == to_user_id, Friendship.user2_id == current_user.id)
        )
    ).first()
    
    if existing_friendship:
        return jsonify({'message': 'Already friends'}), 400
    
    new_request = FriendRequest(
        from_user_id=current_user.id,
        to_user_id=to_user_id
    )
    db.session.add(new_request)
    db.session.commit()
    
    return jsonify({'message': 'Friend request sent successfully'}), 200

@friend_bp.route('/handle_request/<int:request_id>', methods=['POST'])
@login_required
def handle_friend_request(request_id):
    data = request.get_json()
    action = data.get('action')  # 'accept' or 'reject'
    
    friend_request = FriendRequest.query.get_or_404(request_id)
    
    # Verify the request is for the current user
    if friend_request.to_user_id != current_user.id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    if action == 'accept':
        # Create friendship
        new_friendship = Friendship(
            user1_id=friend_request.from_user_id,
            user2_id=friend_request.to_user_id
        )
        db.session.add(new_friendship)
        friend_request.status = 'accepted'
    elif action == 'reject':
        friend_request.status = 'rejected'
    else:
        return jsonify({'message': 'Invalid action'}), 400
    
    db.session.commit()
    return jsonify({'message': f'Friend request {action}ed successfully'}), 200

@friend_bp.route('/friends', methods=['GET'])
@login_required
def get_friends():
    # Get all friendships where current user is either user1 or user2
    friendships = Friendship.query.filter(
        or_(
            Friendship.user1_id == current_user.id,
            Friendship.user2_id == current_user.id
        )
    ).all()
    
    friends = []
    for friendship in friendships:
        friend = friendship.user2 if friendship.user1_id == current_user.id else friendship.user1
        friends.append({
            'id': friend.id,
            'username': friend.username,
            'email': friend.email
        })
    
    return jsonify({'friends': friends}), 200

@friend_bp.route('/pending_requests', methods=['GET'])
@login_required
def get_pending_requests():
    # Get received pending requests
    received_requests = FriendRequest.query.filter_by(
        to_user_id=current_user.id,
        status='pending'
    ).all()
    
    requests = []
    for req in received_requests:
        requests.append({
            'id': req.id,
            'from_user': {
                'id': req.from_user.id,
                'username': req.from_user.username
            },
            'created_at': req.created_at.isoformat()
        })
    
    return jsonify({'pending_requests': requests}), 200

@friend_bp.route('/search_users', methods=['GET'])
@login_required
def search_users():
    search_term = request.args.get('query', '')
    if not search_term:
        return jsonify({'users': []}), 200
    
    # Search for users whose username or email contains the search term
    users = User.query.filter(
        or_(
            User.username.ilike(f'%{search_term}%'),
            User.email.ilike(f'%{search_term}%')
        ),
        User.id != current_user.id  # Exclude current user
    ).limit(10).all()
    
    # Get list of users who already have pending requests
    pending_requests = FriendRequest.query.filter_by(
        from_user_id=current_user.id,
        status='pending'
    ).with_entities(FriendRequest.to_user_id).all()
    pending_request_ids = [r[0] for r in pending_requests]
    
    # Get list of current friends
    friendships = Friendship.query.filter(
        or_(
            Friendship.user1_id == current_user.id,
            Friendship.user2_id == current_user.id
        )
    ).all()
    friend_ids = []
    for friendship in friendships:
        friend_ids.append(friendship.user2_id if friendship.user1_id == current_user.id else friendship.user1_id)
    
    # Format user data with friendship status
    result = []
    for user in users:
        status = 'available'
        if user.id in friend_ids:
            status = 'friend'
        elif user.id in pending_request_ids:
            status = 'pending'
            
        result.append({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'status': status
        })
    
    return jsonify({'users': result}), 200

@friend_bp.route('/pending_request_count', methods=['GET'])
@login_required
def get_pending_request_count():
    # Get count of received pending requests
    count = FriendRequest.query.filter_by(
        to_user_id=current_user.id,
        status='pending'
    ).count()
    
    return jsonify({'count': count}), 200 
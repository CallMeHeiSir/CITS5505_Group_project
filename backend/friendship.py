from flask import Blueprint, jsonify, request, current_app
from flask_login import current_user, login_required
from models.user import User, friendship
from extensions import db
from sqlalchemy import or_, and_
from datetime import datetime

friendship_bp = Blueprint('friendship', __name__)

@friendship_bp.route('/api/friends/search', methods=['GET'])
@login_required
def search_users():
    """搜索用户"""
    query = request.args.get('query', '')
    if not query:
        return jsonify({"success": False, "error": "Search query is required"}), 400
        
    try:
        # 搜索用户名或邮箱匹配的用户
        users = User.query.filter(
            and_(
                or_(
                    User.username.ilike(f'%{query}%'),
                    User.email.ilike(f'%{query}%')
                ),
                User.id != current_user.id  # 排除当前用户
            )
        ).limit(10).all()
        
        # 检查是否已经是好友
        user_list = []
        for user in users:
            is_friend = db.session.query(friendship).filter(
                or_(
                    and_(friendship.c.user_id == current_user.id, friendship.c.friend_id == user.id),
                    and_(friendship.c.user_id == user.id, friendship.c.friend_id == current_user.id)
                )
            ).first() is not None
            
            user_list.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_friend': is_friend
            })
            
        return jsonify({"success": True, "users": user_list})
    except Exception as e:
        current_app.logger.error(f"Error searching users: {str(e)}")
        return jsonify({"success": False, "error": "Failed to search users"}), 500

@friendship_bp.route('/api/friends/request', methods=['POST'])
@login_required
def send_friend_request():
    """发送好友请求"""
    try:
        data = request.get_json()
        friend_id = data.get('friendId')
        
        if not friend_id:
            return jsonify({"success": False, "error": "Friend ID is required"}), 400
            
        # 检查用户是否存在
        friend = User.query.get(friend_id)
        if not friend:
            return jsonify({"success": False, "error": "User not found"}), 404
            
        # 检查是否已经是好友
        existing_friendship = db.session.query(friendship).filter(
            or_(
                and_(friendship.c.user_id == current_user.id, friendship.c.friend_id == friend_id),
                and_(friendship.c.user_id == friend_id, friendship.c.friend_id == current_user.id)
            )
        ).first()
        
        if existing_friendship:
            return jsonify({
                "success": False, 
                "error": "Already friends"
            }), 400
            
        # 创建好友关系
        db.session.execute(friendship.insert().values(
            user_id=current_user.id,
            friend_id=friend_id
        ))
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Friend request sent successfully"
        })
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error sending friend request: {str(e)}")
        return jsonify({"success": False, "error": "Failed to send friend request"}), 500

@friendship_bp.route('/api/friends', methods=['GET'])
@login_required
def get_friends():
    """获取好友列表"""
    try:
        # 获取所有好友关系
        friendships = db.session.query(friendship).filter(
            or_(
                friendship.c.user_id == current_user.id,
                friendship.c.friend_id == current_user.id
            )
        ).all()
        
        friends_list = []
        for f in friendships:
            friend_id = f.friend_id if f.user_id == current_user.id else f.user_id
            friend = User.query.get(friend_id)
            if friend:
                friends_list.append({
                    'id': friend.id,
                    'username': friend.username,
                    'email': friend.email
                })
            
        return jsonify({"success": True, "friends": friends_list})
        
    except Exception as e:
        current_app.logger.error(f"Error getting friends list: {str(e)}")
        return jsonify({"success": False, "error": "Failed to get friends list"}), 500

@friendship_bp.route('/api/friends/pending', methods=['GET'])
@login_required
def get_pending_requests():
    """获取待处理的好友请求"""
    try:
        # 获取收到的待处理请求
        received_requests = db.session.query(friendship).filter(
            friendship.c.friend_id == current_user.id,
            friendship.c.status == 'pending'
        ).all()
        
        # 获取发送的待处理请求
        sent_requests = db.session.query(friendship).filter(
            friendship.c.user_id == current_user.id,
            friendship.c.status == 'pending'
        ).all()
        
        return jsonify({
            "success": True,
            "received": [req.to_dict() for req in received_requests],
            "sent": [req.to_dict() for req in sent_requests]
        })
        
    except Exception as e:
        current_app.logger.error(f"Error getting pending requests: {str(e)}")
        return jsonify({"success": False, "error": "Failed to get pending requests"}), 500

@friendship_bp.route('/api/friends/<int:friend_id>', methods=['DELETE'])
@login_required
def remove_friend(friend_id):
    """删除好友"""
    try:
        # 获取好友关系
        friendship_record = db.session.query(friendship).filter(
            or_(
                and_(friendship.c.user_id == current_user.id, friendship.c.friend_id == friend_id),
                and_(friendship.c.user_id == friend_id, friendship.c.friend_id == current_user.id)
            )
        ).first()
        
        if not friendship_record:
            return jsonify({"success": False, "error": "Friendship not found"}), 404
            
        # 删除好友关系
        db.session.execute(friendship.delete().where(
            or_(
                and_(friendship.c.user_id == current_user.id, friendship.c.friend_id == friend_id),
                and_(friendship.c.user_id == friend_id, friendship.c.friend_id == current_user.id)
            )
        ))
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Friend removed successfully"
        })
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error removing friend: {str(e)}")
        return jsonify({"success": False, "error": "Failed to remove friend"}), 500 
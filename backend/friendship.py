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
    current_app.logger.info(f"Search query: {query}")
    current_app.logger.info(f"Current user ID: {current_user.id}")
    
    if not query:
        return jsonify({"success": False, "error": "Search query is required"}), 400
        
    try:
        # 构建搜索查询
        search_query = User.query.filter(
            and_(
                or_(
                    User.username.ilike(f'%{query}%'),
                    User.email.ilike(f'%{query}%')
                ),
                User.id != current_user.id  # 排除当前用户
            )
        )
        
        # 打印SQL查询
        current_app.logger.info(f"SQL Query: {search_query}")
        
        # 执行查询
        users = search_query.limit(10).all()
        current_app.logger.info(f"Found {len(users)} users matching query")
        
        # 打印找到的用户
        for user in users:
            current_app.logger.info(f"Found user: ID={user.id}, Username={user.username}, Email={user.email}")
        
        # 检查是否已经是好友或有待处理的请求
        user_list = []
        for user in users:
            current_app.logger.info(f"Processing user: {user.username}")
            # 检查好友关系状态
            friendship_status = db.session.query(friendship).filter(
                or_(
                    and_(friendship.c.user_id == current_user.id, friendship.c.friend_id == user.id),
                    and_(friendship.c.user_id == user.id, friendship.c.friend_id == current_user.id)
                )
            ).first()
            
            status = None
            if friendship_status:
                status = friendship_status.status
                current_app.logger.info(f"Friendship status with {user.username}: {status}")
            
            user_data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_friend': status == 'accepted',
                'has_pending': status == 'pending'
            }
            user_list.append(user_data)
            current_app.logger.info(f"Added user to response: {user_data}")
            
        current_app.logger.info(f"Returning {len(user_list)} users")
        return jsonify({"success": True, "users": user_list})
    except Exception as e:
        current_app.logger.error(f"Error searching users: {str(e)}")
        import traceback
        current_app.logger.error(traceback.format_exc())
        return jsonify({"success": False, "error": "Failed to search users"}), 500

@friendship_bp.route('/api/friends/test_search', methods=['GET'])
@login_required
def test_search():
    """测试搜索功能"""
    query = request.args.get('query', '')
    current_app.logger.info(f"Test search query: {query}")
    
    try:
        # 直接搜索用户名
        username_matches = User.query.filter(User.username.ilike(f'%{query}%')).all()
        # 直接搜索邮箱
        email_matches = User.query.filter(User.email.ilike(f'%{query}%')).all()
        
        result = {
            "query": query,
            "username_matches": [{"id": u.id, "username": u.username, "email": u.email} for u in username_matches],
            "email_matches": [{"id": u.id, "username": u.username, "email": u.email} for u in email_matches]
        }
        
        return jsonify({"success": True, "result": result})
    except Exception as e:
        current_app.logger.error(f"Error in test search: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

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
            
        # 检查是否已经有好友关系或待处理的请求
        existing_friendship = db.session.query(friendship).filter(
            or_(
                and_(friendship.c.user_id == current_user.id, friendship.c.friend_id == friend_id),
                and_(friendship.c.user_id == friend_id, friendship.c.friend_id == current_user.id)
            )
        ).first()
        
        if existing_friendship:
            if existing_friendship.status == 'accepted':
                return jsonify({
                    "success": False, 
                    "error": "Already friends"
                }), 400
            elif existing_friendship.status == 'pending':
                return jsonify({
                    "success": False, 
                    "error": "Friend request already sent"
                }), 400
            
        # 创建好友请求
        db.session.execute(friendship.insert().values(
            user_id=current_user.id,
            friend_id=friend_id,
            status='pending',
            created_at=datetime.utcnow()
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
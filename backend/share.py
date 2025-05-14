from flask import Blueprint, request, jsonify
from extensions import db
from models.user import User
from models.activity_records import ActivityRecord
from models.friendship import Friendship
from flask_login import login_required, current_user
from datetime import datetime
from sqlalchemy import desc

share_bp = Blueprint('share', __name__)

@share_bp.route('/api/share/friends', methods=['GET'])
@login_required
def get_friends_list():
    """Get list of current user's friends for sharing"""
    try:
        friends = Friendship.get_friends(current_user.id)
        return jsonify({
            'status': 'success',
            'friends': [{
                'id': friend.id,
                'username': friend.username,
                'email': friend.email
            } for friend in friends]
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@share_bp.route('/api/share/activity', methods=['POST'])
@login_required
def share_activity():
    try:
        data = request.get_json()
        activity_id = data.get('activity_id')
        share_to_user_id = data.get('share_to_user_id')
        visualization_type = data.get('visualization_type')  # 新增：可视化类型
        custom_message = data.get('message', '')  # 新增：分享时的个人消息
        
        # 验证是否是好友关系
        if not Friendship.are_friends(current_user.id, share_to_user_id):
            return jsonify({
                'status': 'error',
                'message': 'You can only share with your friends'
            }), 403
        
        # Verify if the activity exists and belongs to the current user
        activity = ActivityRecord.query.filter_by(
            id=activity_id, 
            user_id=current_user.id
        ).first()
        
        if not activity:
            return jsonify({
                'status': 'error',
                'message': 'Activity not found or you do not have permission'
            }), 404
            
        # Verify if the target user exists
        target_user = User.query.get(share_to_user_id)
        if not target_user:
            return jsonify({
                'status': 'error',
                'message': 'Target user not found'
            }), 404
            
        # Create a new activity record for the target user
        shared_activity = ActivityRecord(
            user_id=share_to_user_id,
            activity_type=activity.activity_type,
            duration=activity.duration,
            distance=activity.distance,
            calories=activity.calories,
            start_time=activity.start_time,
            end_time=activity.end_time,
            notes=activity.notes,
            shared_from=current_user.id,
            visualization_type=visualization_type,  # 新增：记录可视化类型
            share_message=custom_message,  # 新增：记录分享消息
            created_at=datetime.utcnow()
        )
        
        db.session.add(shared_activity)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Activity shared successfully',
            'shared_activity_id': shared_activity.id
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@share_bp.route('/api/share/batch', methods=['POST'])
@login_required
def batch_share_activities():
    try:
        data = request.get_json()
        activity_ids = data.get('activity_ids', [])
        share_to_user_id = data.get('share_to_user_id')
        
        if not activity_ids:
            return jsonify({
                'status': 'error',
                'message': 'No activities specified'
            }), 400
            
        # Verify if target user exists
        target_user = User.query.get(share_to_user_id)
        if not target_user:
            return jsonify({
                'status': 'error',
                'message': 'Target user not found'
            }), 404
            
        shared_activities = []
        for activity_id in activity_ids:
            # Verify if activity exists and belongs to current user
            activity = ActivityRecord.query.filter_by(
                id=activity_id,
                user_id=current_user.id
            ).first()
            
            if activity:
                shared_activity = ActivityRecord(
                    user_id=share_to_user_id,
                    activity_type=activity.activity_type,
                    duration=activity.duration,
                    distance=activity.distance,
                    calories=activity.calories,
                    start_time=activity.start_time,
                    end_time=activity.end_time,
                    notes=activity.notes,
                    shared_from=current_user.id,
                    created_at=datetime.utcnow()
                )
                shared_activities.append(shared_activity)
        
        if shared_activities:
            db.session.bulk_save_objects(shared_activities)
            db.session.commit()
            
            return jsonify({
                'status': 'success',
                'message': f'Successfully shared {len(shared_activities)} activities',
                'shared_count': len(shared_activities)
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'No valid activities to share'
            }), 400
            
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@share_bp.route('/api/share/batch_revoke', methods=['POST'])
@login_required
def batch_revoke_shares():
    try:
        data = request.get_json()
        activity_ids = data.get('activity_ids', [])
        
        if not activity_ids:
            return jsonify({
                'status': 'error',
                'message': 'No activities specified'
            }), 400
            
        # Find all shared activities that belong to the current user
        shared_activities = ActivityRecord.query.filter(
            ActivityRecord.id.in_(activity_ids),
            ActivityRecord.shared_from == current_user.id
        ).all()
        
        if shared_activities:
            for activity in shared_activities:
                db.session.delete(activity)
            db.session.commit()
            
            return jsonify({
                'status': 'success',
                'message': f'Successfully revoked {len(shared_activities)} shares',
                'revoked_count': len(shared_activities)
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'No valid shares to revoke'
            }), 400
            
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@share_bp.route('/api/share/received', methods=['GET'])
@login_required
def get_received_shares():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        query = ActivityRecord.query.filter(
            ActivityRecord.user_id == current_user.id,
            ActivityRecord.shared_from.isnot(None)
        ).order_by(desc(ActivityRecord.created_at))
        
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        total_pages = pagination.pages
        total_items = pagination.total
        
        activities_data = []
        for activity in pagination.items:
            shared_from_user = User.query.get(activity.shared_from)
            activities_data.append({
                'id': activity.id,
                'activity_type': activity.activity_type,
                'duration': activity.duration,
                'distance': activity.distance,
                'calories': activity.calories,
                'start_time': activity.start_time.isoformat(),
                'end_time': activity.end_time.isoformat(),
                'notes': activity.notes,
                'visualization_type': activity.visualization_type,  # 新增：返回可视化类型
                'share_message': activity.share_message,  # 新增：返回分享消息
                'shared_from': {
                    'id': shared_from_user.id,
                    'username': shared_from_user.username
                },
                'created_at': activity.created_at.isoformat()
            })
            
        return jsonify({
            'status': 'success',
            'shared_activities': activities_data,
            'pagination': {
                'current_page': page,
                'total_pages': total_pages,
                'total_items': total_items,
                'per_page': per_page
            }
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@share_bp.route('/api/share/sent', methods=['GET'])
@login_required
def get_sent_shares():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        query = ActivityRecord.query.filter(
            ActivityRecord.shared_from == current_user.id
        ).order_by(desc(ActivityRecord.created_at))
        
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        total_pages = pagination.pages
        total_items = pagination.total
        
        activities_data = []
        for activity in pagination.items:
            shared_to_user = User.query.get(activity.user_id)
            activities_data.append({
                'id': activity.id,
                'activity_type': activity.activity_type,
                'duration': activity.duration,
                'distance': activity.distance,
                'calories': activity.calories,
                'start_time': activity.start_time.isoformat(),
                'end_time': activity.end_time.isoformat(),
                'notes': activity.notes,
                'shared_to': {
                    'id': shared_to_user.id,
                    'username': shared_to_user.username
                },
                'created_at': activity.created_at.isoformat()
            })
            
        return jsonify({
            'status': 'success',
            'sent_activities': activities_data,
            'pagination': {
                'current_page': page,
                'total_pages': total_pages,
                'total_items': total_items,
                'per_page': per_page
            }
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@share_bp.route('/api/share/revoke/<int:activity_id>', methods=['DELETE'])
@login_required
def revoke_share(activity_id):
    try:
        # Find the shared activity
        shared_activity = ActivityRecord.query.filter_by(
            id=activity_id,
            shared_from=current_user.id
        ).first()
        
        if not shared_activity:
            return jsonify({
                'status': 'error',
                'message': 'Shared activity not found or you do not have permission to revoke it'
            }), 404
            
        # Delete the shared activity
        db.session.delete(shared_activity)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Share revoked successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500 
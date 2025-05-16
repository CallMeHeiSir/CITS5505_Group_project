from flask import Blueprint, request, jsonify
from extensions import db
from models.user import User
from models.activity_log import ActivityLog
from models.friend import Friendship
from models.share_log import ShareLog
from flask_login import login_required, current_user
from datetime import datetime
from sqlalchemy import desc
import json
from forms import ShareForm
from flask_wtf.csrf import CSRFProtect

share_bp = Blueprint('share', __name__)
csrf = CSRFProtect()

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
        # Get data from FormData
        share_to_user_id = request.form.get('share_to_user_id')
        share_message = request.form.get('share_message', '')
        share_type = request.form.get('share_type')
        visualization_type = request.form.get('visualization_type')
        activity_id = request.form.get('activity_id')
        snapshot = request.form.get('snapshot')

        # Verify if they are friends
        if not Friendship.are_friends(current_user.id, int(share_to_user_id)):
            return jsonify({
                'status': 'error',
                'message': 'You can only share with your friends'
            }), 403

        # Allow activity_id to be empty (for chart/dashboard sharing)
        activity = None
        if activity_id:
            activity = ActivityLog.query.filter_by(
                id=activity_id, 
                user_id=current_user.id
            ).first()
            if not activity:
                return jsonify({
                    'status': 'error',
                    'message': 'Activity not found or you do not have permission'
                }), 404

        # Verify if the target user exists
        target_user = db.session.get(User, int(share_to_user_id))
        if not target_user:
            return jsonify({
                'status': 'error',
                'message': 'Target user not found'
            }), 404

        # Handle snapshot data
        if snapshot:
            try:
                snapshot = json.loads(snapshot)
            except json.JSONDecodeError:
                return jsonify({
                    'status': 'error',
                    'message': 'Invalid snapshot data'
                }), 400

        # Create a new share log record for the target user
        share_log = ShareLog(
            from_user_id=current_user.id,
            to_user_id=int(share_to_user_id),
            activity_log_id=activity_id if activity else None,
            share_type=share_type,
            snapshot=json.dumps(snapshot) if snapshot is not None else None,
            share_message=share_message,
            created_at=datetime.utcnow(),
            status='active'
        )
        db.session.add(share_log)
        db.session.commit()

        return jsonify({
            'status': 'success',
            'message': 'Activity shared successfully'
        })

    except Exception as e:
        db.session.rollback()
        print(f"Error in share_activity: {str(e)}")  # Add error log
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
        target_user = db.session.get(User, share_to_user_id)
        if not target_user:
            return jsonify({
                'status': 'error',
                'message': 'Target user not found'
            }), 404
            
        share_logs = []
        for activity_id in activity_ids:
            # Verify if activity exists and belongs to current user
            activity = ActivityLog.query.filter_by(
                id=activity_id,
                user_id=current_user.id
            ).first()
            
            if activity:
                share_log = ShareLog(
                    from_user_id=current_user.id,
                    to_user_id=share_to_user_id,
                    activity_log_id=activity_id,
                    share_type='activity',
                    snapshot=None,
                    share_message='',
                    created_at=datetime.utcnow(),
                    status='active'
                )
                share_logs.append(share_log)
        
        if share_logs:
            db.session.bulk_save_objects(share_logs)
            db.session.commit()
            
            return jsonify({
                'status': 'success',
                'message': f'Successfully shared {len(share_logs)} activities',
                'shared_count': len(share_logs)
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
        share_ids = data.get('share_ids', [])
        
        if not share_ids:
            return jsonify({
                'status': 'error',
                'message': 'No shares specified'
            }), 400
            
        # Find all share logs that belong to the current user
        share_logs = ShareLog.query.filter(
            ShareLog.id.in_(share_ids),
            ShareLog.from_user_id == current_user.id
        ).all()
        
        if share_logs:
            for share in share_logs:
                share.status = 'revoked'
            db.session.bulk_save_objects(share_logs)
            db.session.commit()
            
            return jsonify({
                'status': 'success',
                'message': f'Successfully revoked {len(share_logs)} shares',
                'revoked_count': len(share_logs)
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
        
        query = ShareLog.query.filter_by(to_user_id=current_user.id, status='active').order_by(ShareLog.created_at.desc())
        
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        total_pages = pagination.pages
        total_items = pagination.total
        
        activities_data = []
        for share in pagination.items:
            from_user = User.query.get(share.from_user_id)
            activity = ActivityLog.query.get(share.activity_log_id)
            activities_data.append({
                'id': share.id,
                'activity_type': activity.activity_type if activity else None,
                'date': activity.date.isoformat() if activity and activity.date else None,
                'duration': activity.duration if activity else None,
                'distance': activity.distance if activity else None,
                'reps': activity.reps if activity else None,
                'calories': activity.calories if activity else None,
                'height': activity.height if activity else None,
                'weight': activity.weight if activity else None,
                'age': activity.age if activity else None,
                'location': activity.location if activity else None,
                'visualization_type': activity.visualization_type if activity else None,
                'share_message': share.share_message,
                'share_type': share.share_type,
                'snapshot': share.snapshot,
                'shared_from': {
                    'id': from_user.id,
                    'username': from_user.username
                } if from_user else None,
                'created_at': share.created_at.isoformat() if share.created_at else None
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
        
        query = ShareLog.query.filter_by(from_user_id=current_user.id, status='active').order_by(ShareLog.created_at.desc())
        
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        total_pages = pagination.pages
        total_items = pagination.total
        
        activities_data = []
        for share in pagination.items:
            to_user = User.query.get(share.to_user_id)
            activity = ActivityLog.query.get(share.activity_log_id)
            activities_data.append({
                'id': share.id,
                'activity_type': activity.activity_type if activity else None,
                'date': activity.date.isoformat() if activity and activity.date else None,
                'duration': activity.duration if activity else None,
                'distance': activity.distance if activity else None,
                'reps': activity.reps if activity else None,
                'calories': activity.calories if activity else None,
                'height': activity.height if activity else None,
                'weight': activity.weight if activity else None,
                'age': activity.age if activity else None,
                'location': activity.location if activity else None,
                'visualization_type': activity.visualization_type if activity else None,
                'share_message': share.share_message,
                'share_type': share.share_type,
                'snapshot': share.snapshot,
                'shared_to': {
                    'id': to_user.id,
                    'username': to_user.username
                } if to_user else None,
                'created_at': share.created_at.isoformat() if share.created_at else None
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

@share_bp.route('/api/share/revoke/<int:share_id>', methods=['DELETE'])
@login_required
def revoke_share(share_id):
    try:
        # Find the share log
        share = ShareLog.query.filter_by(id=share_id, from_user_id=current_user.id, status='active').first()
        
        if not share:
            return jsonify({
                'status': 'error',
                'message': 'Share not found or you do not have permission to revoke it'
            }), 404
            
        # Update the status of the share log
        share.status = 'revoked'
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
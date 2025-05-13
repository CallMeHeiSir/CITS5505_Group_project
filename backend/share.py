from flask import Blueprint, jsonify, request, current_app
from flask_login import current_user, login_required
from models.share import Share, ShareRecipient
from models.user import User, friendship
from extensions import db
from sqlalchemy import desc
from datetime import datetime
from models.activity_log import ActivityLog
from sqlalchemy import or_, and_

share_bp = Blueprint('share', __name__)

@share_bp.route('/shares/available-charts', methods=['GET'])
@login_required
def get_available_charts():
    """Get list of charts available for sharing"""
    try:
        # Get user's activity data
        user_activities = ActivityLog.query.filter_by(user_id=current_user.id).all()
        
        # Only show charts if user has activity data
        if user_activities:
            charts = [
                {"id": "weekly_activity", "title": "Weekly Activity Summary"},
                {"id": "monthly_progress", "title": "Monthly Progress"},
                {"id": "activity_distribution", "title": "Activity Distribution"},
                {"id": "calories_trend", "title": "Calories Trend"},
                {"id": "activity_stats", "title": "Activity Statistics"}
            ]
        else:
            charts = []
            
        return jsonify({"success": True, "charts": charts})
    except Exception as e:
        current_app.logger.error(f"Error getting available charts: {str(e)}")
        return jsonify({"success": False, "error": "Failed to get available charts"}), 500

@share_bp.route('/shares/friends', methods=['GET'])
@login_required
def get_friends():
    """Get user's friends list"""
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
                    'id': str(friend.id),  # 转换为字符串以保持与前端兼容
                    'name': friend.username
                })
            
        return jsonify({"success": True, "friends": friends_list})
    except Exception as e:
        current_app.logger.error(f"Error getting friends list: {str(e)}")
        return jsonify({"success": False, "error": "Failed to get friends list"}), 500

@share_bp.route('/shares', methods=['POST'])
@login_required
def create_share():
    """Create a new share"""
    try:
        data = request.get_json()
        chart_id = data.get('chartId')
        chart_title = data.get('chartTitle')
        recipient_id = data.get('recipientId')

        if not all([chart_id, chart_title, recipient_id]):
            return jsonify({"success": False, "error": "Missing required fields"}), 400

        # Create share record
        share = Share(
            user_id=current_user.id,
            chart_id=chart_id,
            chart_title=chart_title,
            created_at=datetime.utcnow()
        )
        db.session.add(share)
        db.session.flush()  # Flush to get the share.id
        
        # Create recipient record
        share_recipient = ShareRecipient(
            share_id=share.id,
            recipient_id=recipient_id,
            status='pending'
        )
        db.session.add(share_recipient)
        
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Share created successfully",
            "share": {
                "id": share.id,
                "chartId": share.chart_id,
                "chartTitle": share.chart_title,
                "createdAt": share.created_at.isoformat()
            }
        })

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating share: {str(e)}")
        return jsonify({"success": False, "error": "Failed to create share"}), 500

@share_bp.route('/shares/received', methods=['GET'])
@login_required
def get_received_shares():
    """Get shares received by the current user"""
    try:
        received_shares = ShareRecipient.query.filter_by(
            recipient_id=current_user.id
        ).join(Share).all()

        shares_list = [{
            "id": share.share.id,
            "chartId": share.share.chart_id,
            "chartTitle": share.share.chart_title,
            "fromUser": share.share.user.username,
            "time": share.share.created_at.isoformat(),
            "status": share.status
        } for share in received_shares]

        return jsonify({"success": True, "shares": shares_list})

    except Exception as e:
        current_app.logger.error(f"Error getting received shares: {str(e)}")
        return jsonify({"success": False, "error": "Failed to get received shares"}), 500

@share_bp.route('/shares/sent', methods=['GET'])
@login_required
def get_sent_shares():
    """Get shares sent by the current user"""
    try:
        sent_shares = Share.query.filter_by(
            user_id=current_user.id
        ).join(ShareRecipient).all()

        shares_list = [{
            "id": share.id,
            "chartId": share.chart_id,
            "chartTitle": share.chart_title,
            "toUser": share.recipients[0].recipient.username if share.recipients else None,
            "time": share.created_at.isoformat(),
            "status": share.recipients[0].status if share.recipients else None
        } for share in sent_shares]

        return jsonify({"success": True, "shares": shares_list})

    except Exception as e:
        current_app.logger.error(f"Error getting sent shares: {str(e)}")
        return jsonify({"success": False, "error": "Failed to get sent shares"}), 500

@share_bp.route('/shares/<int:share_id>', methods=['DELETE'])
@login_required
def withdraw_share(share_id):
    """Withdraw a share"""
    try:
        share = Share.query.filter_by(
            id=share_id,
            user_id=current_user.id
        ).first()

        if not share:
            return jsonify({"success": False, "error": "Share not found"}), 404

        # Delete recipient records
        ShareRecipient.query.filter_by(share_id=share.id).delete()
        
        # Delete share record
        db.session.delete(share)
        db.session.commit()

        return jsonify({"success": True, "message": "Share withdrawn successfully"})

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error withdrawing share: {str(e)}")
        return jsonify({"success": False, "error": "Failed to withdraw share"}), 500 
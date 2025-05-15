from flask import Blueprint, jsonify
from flask_login import login_required, current_user
from models.activity_log import ActivityLog

activity_records = Blueprint('activity_records', __name__)

@activity_records.route('/api/activities', methods=['GET'])
@login_required
def get_activities():
    activities = ActivityLog.query.filter_by(user_id=current_user.id).filter(ActivityLog.shared_from == None).order_by(ActivityLog.date.desc(), ActivityLog.created_at.desc()).all()
    return jsonify({
        'activities': [
            {
                'id': a.id,
                'activity_type': a.activity_type,
                'date': a.date.isoformat(),
                'duration': a.duration,
                'distance': a.distance,
                'reps': a.reps,
                'calories': a.calories,
                'height': a.height,
                'weight': a.weight,
                'age': a.age,
                'location': a.location,
                'created_at': a.created_at.isoformat() if a.created_at else None
            } for a in activities
        ]
    }) 
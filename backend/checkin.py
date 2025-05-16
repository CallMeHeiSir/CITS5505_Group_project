from flask import Blueprint, jsonify
from flask_login import login_required, current_user
from datetime import datetime, timedelta, date
from extensions import db
from models.check_in_log import CheckInLog

checkin_bp = Blueprint('checkin', __name__)

@checkin_bp.route('/api/checkin', methods=['POST'])
@login_required
def daily_checkin():
    today = datetime.now().date()

    # Do not check for existing records, allow unlimited check-ins
    new_log = CheckInLog(user_id=current_user.id, checkin_date=today)
    db.session.add(new_log)
    db.session.commit()

    # streak = number of consecutive days with at least one check-in
    streak = 0
    for i in range(0, 100):
        day = today - timedelta(days=i)
        count = CheckInLog.query.filter_by(user_id=current_user.id, checkin_date=day).count()
        if count > 0:
            streak += 1
        else:
            break

    return jsonify({'success': True, 'streak': streak}), 200


@checkin_bp.route('/api/checkin/status', methods=['GET'])
@login_required
def checkin_status():
    today = datetime.now().date()
    streak = 0
    for i in range(0, 100):
        day = today - timedelta(days=i)
        count = CheckInLog.query.filter_by(user_id=current_user.id, checkin_date=day).count()
        if count > 0:
            streak += 1
        else:
            break
    return jsonify({'streak': streak})

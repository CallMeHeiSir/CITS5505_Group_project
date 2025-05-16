from flask import Blueprint, jsonify
from flask_login import login_required, current_user
from datetime import datetime, timedelta, date
from extensions import db
from models.check_in_log import CheckInLog

checkin_bp = Blueprint('checkin', __name__)

@checkin_bp.route('/checkin', methods=['POST'])
@login_required
def daily_checkin():
    today = datetime.now().date()

    # ✅ 不判断是否已有记录，允许无限打卡
    new_log = CheckInLog(user_id=current_user.id, checkin_date=today)
    db.session.add(new_log)
    db.session.commit()

    # ✅ streak = 连续多少天都有"至少一次打卡"
    streak = 0
    for i in range(0, 100):
        day = today - timedelta(days=i)
        count = CheckInLog.query.filter_by(user_id=current_user.id, checkin_date=day).count()
        if count > 0:
            streak += 1
        else:
            break

    return jsonify({'success': True, 'streak': streak}), 200


@checkin_bp.route('/checkin/status', methods=['GET'])
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

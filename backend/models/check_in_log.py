from extensions import db
from datetime import date

class CheckInLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    checkin_date = db.Column(db.Date, nullable=False, default=date.today)

    def __repr__(self):
        return f'<CheckInLog user={self.user_id} date={self.checkin_date}>'

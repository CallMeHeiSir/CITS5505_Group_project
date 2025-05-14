from app import db
from datetime import datetime

class ActivityLog(db.Model):
    __tablename__ = 'activity_log'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    activity_type = db.Column(db.String(50), nullable=False)
    date = db.Column(db.Date, nullable=False)
    duration = db.Column(db.Integer)
    distance = db.Column(db.Float)
    reps = db.Column(db.Integer)
    calories = db.Column(db.Integer)
    height = db.Column(db.Integer)
    weight = db.Column(db.Integer)
    age = db.Column(db.Integer)
    location = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    shared_from = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    visualization_type = db.Column(db.String(50), nullable=True)
    share_message = db.Column(db.Text, nullable=True)

    # Calorie calculation factors (calories per minute)
    CALORIE_FACTORS = {
        # Cardio exercises
        'running': 10,      # Running: 10 cal/min
        'cycling': 8,       # Cycling: 8 cal/min
        'swimming': 9,      # Swimming: 9 cal/min
        'walking': 5,       # Walking: 5 cal/min
        'hiking': 7,        # Hiking: 7 cal/min
        'dancing': 6,       # Dancing: 6 cal/min
        'jumping': 8,       # Jumping Rope: 8 cal/min
        'climbing': 9,      # Rock Climbing: 9 cal/min
        'skating': 7,       # Skating: 7 cal/min
        'skiing': 8,        # Skiing: 8 cal/min
        
        # Strength training
        'pushup': 6,        # Push-ups: 6 cal/min
        'situp': 5,         # Sit-ups: 5 cal/min
        'pullup': 7,        # Pull-ups: 7 cal/min
        'squats': 6,        # Squats: 6 cal/min
        'plank': 4,         # Plank: 4 cal/min
        'lunges': 5,        # Lunges: 5 cal/min
        'deadlift': 8,      # Deadlift: 8 cal/min
        'bench_press': 7,   # Bench Press: 7 cal/min
        
        # Flexibility training
        'yoga': 4,          # Yoga: 4 cal/min
        'pilates': 4,       # Pilates: 4 cal/min
        'stretching': 3,    # Stretching: 3 cal/min
        
        # Ball sports
        'basketball': 8,    # Basketball: 8 cal/min
        'tennis': 7,        # Tennis: 7 cal/min
        'badminton': 6,     # Badminton: 6 cal/min
        'volleyball': 6,    # Volleyball: 6 cal/min
        'football': 9,      # Football: 9 cal/min
        'golf': 4,          # Golf: 4 cal/min
        
        # Others
        'other': 5          # Other: 5 cal/min
    }

    def calculate_calories(self):
        """Calculate calories burned during the activity"""
        base_calories = 0
        
        # Get base consumption factor based on activity type
        # If activity type is not in our list, use 'other' factor (5 cal/min)
        factor = self.CALORIE_FACTORS.get(self.activity_type, self.CALORIE_FACTORS['other'])
        
        # Base consumption = time * factor
        if self.duration:
            base_calories = self.duration * factor
        
        # Add consumption based on distance or reps
        if self.distance:
            # Distance consumption = distance(km) * weight(kg) * 0.1
            base_calories += self.distance * self.weight * 0.1
        
        if self.reps:
            # Reps consumption = reps * weight(kg) * 0.05
            base_calories += self.reps * self.weight * 0.05
        
        # Consider age factor: older people burn fewer calories
        age_factor = 1.0
        if self.age:
            if self.age > 50:
                age_factor = 0.9
            elif self.age > 40:
                age_factor = 0.95
        
        # Final calories = base consumption * age factor
        return int(base_calories * age_factor) 
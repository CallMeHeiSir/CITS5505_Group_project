from flask_wtf import FlaskForm
from wtforms import StringField, IntegerField, SelectField, FloatField, ValidationError, TextAreaField, SubmitField
from wtforms.fields import DateField
from wtforms.validators import DataRequired, NumberRange, Length, Optional, Email
from datetime import datetime

class MultiFormatDateField(DateField):
    def process_formdata(self, valuelist):
        if valuelist:
            date_str = valuelist[0]
            for fmt in ('%Y-%m-%d', '%d/%m/%Y'):
                try:
                    self.data = datetime.strptime(date_str, fmt).date()
                    return
                except ValueError:
                    continue
            raise ValidationError('Date must be in YYYY-MM-DD or DD/MM/YYYY format')

class ActivityForm(FlaskForm):
    activity_type = SelectField('Activity Type', choices=[
        # Cardio
        ('running', 'Running'),
        ('cycling', 'Cycling'),
        ('swimming', 'Swimming'),
        ('walking', 'Walking'),
        ('hiking', 'Hiking'),
        ('dancing', 'Dancing'),
        ('jumping', 'Jumping Rope'),
        ('climbing', 'Rock Climbing'),
        ('skating', 'Skating'),
        ('skiing', 'Skiing'),
        
        # Strength Training
        ('pushup', 'Push-up'),
        ('situp', 'Sit-up'),
        ('pullup', 'Pull-up'),
        ('squats', 'Squats'),
        ('plank', 'Plank'),
        ('lunges', 'Lunges'),
        ('deadlift', 'Deadlift'),
        ('bench_press', 'Bench Press'),
        
        # Flexibility Training
        ('yoga', 'Yoga'),
        ('pilates', 'Pilates'),
        ('stretching', 'Stretching'),
        
        # Ball Sports
        ('basketball', 'Basketball'),
        ('tennis', 'Tennis'),
        ('badminton', 'Badminton'),
        ('volleyball', 'Volleyball'),
        ('football', 'Football'),
        ('golf', 'Golf'),
        
        # Other
        ('other', 'Other')
    ], validators=[DataRequired()])
    
    date = MultiFormatDateField('Date', validators=[DataRequired()])
    
    duration = IntegerField('Duration (minutes)', validators=[
        DataRequired(),
        NumberRange(min=1, message='Duration must be at least 1 minute')
    ])
    
    distance = FloatField('Distance (km)', validators=[
        Optional(),
        NumberRange(min=0, message='Distance cannot be negative')
    ])
    
    reps = IntegerField('Reps (count)', validators=[
        Optional(),
        NumberRange(min=0, message='Reps cannot be negative')
    ])
    
    height = IntegerField('Height (cm)', validators=[
        DataRequired(),
        NumberRange(min=0, max=300, message='Please enter a valid height')
    ])
    
    weight = IntegerField('Weight (kg)', validators=[
        DataRequired(),
        NumberRange(min=0, max=500, message='Please enter a valid weight')
    ])
    
    age = IntegerField('Age', validators=[
        DataRequired(),
        NumberRange(min=0, max=120, message='Please enter a valid age')
    ])
    
    location = StringField('Location', validators=[
        DataRequired(),
        Length(min=1, max=100, message='Location must be between 1 and 100 characters')
    ])

class RevokeShareForm(FlaskForm):
    """Form for revoking a shared activity. Only used for CSRF protection."""
    pass

class ShareForm(FlaskForm):
    share_to_user_id = SelectField('Friend', validators=[DataRequired()], coerce=int)
    share_message = TextAreaField('Message', validators=[Optional(), Length(max=500)])
    share_type = StringField('Share Type', validators=[DataRequired()])
    visualization_type = StringField('Visualization Type', validators=[Optional()])
    activity_id = StringField('Activity ID', validators=[Optional()])
    submit = SubmitField('Share')

class VisualizationFilterForm(FlaskForm):
    """Form for filtering visualization data."""
    startDate = DateField('Start Date', validators=[Optional()])
    endDate = DateField('End Date', validators=[Optional()])
    activityType = SelectField('Activity Type', validators=[Optional()], choices=[
        ('', 'All Activities'),
        ('running', 'Running'),
        ('cycling', 'Cycling'),
        ('swimming', 'Swimming'),
        ('walking', 'Walking'),
        ('hiking', 'Hiking'),
        ('dancing', 'Dancing'),
        ('jumping', 'Jumping Rope'),
        ('climbing', 'Rock Climbing'),
        ('skating', 'Skating'),
        ('skiing', 'Skiing'),
        ('pushup', 'Push-up'),
        ('situp', 'Sit-up'),
        ('pullup', 'Pull-up'),
        ('squats', 'Squats'),
        ('plank', 'Plank'),
        ('lunges', 'Lunges'),
        ('deadlift', 'Deadlift'),
        ('bench_press', 'Bench Press'),
        ('yoga', 'Yoga'),
        ('pilates', 'Pilates'),
        ('stretching', 'Stretching'),
        ('basketball', 'Basketball'),
        ('tennis', 'Tennis'),
        ('badminton', 'Badminton'),
        ('volleyball', 'Volleyball'),
        ('football', 'Football'),
        ('golf', 'Golf'),
        ('other', 'Other')
    ])
    submit = SubmitField('Apply Filters')
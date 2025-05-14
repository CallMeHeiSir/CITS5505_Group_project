from flask_wtf import FlaskForm
from wtforms import StringField, IntegerField, SelectField, FloatField, ValidationError
from wtforms.fields import DateField
from wtforms.validators import DataRequired, NumberRange, Length, Optional
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
        ('running', 'Running'),
        ('cycling', 'Cycling'),
        ('swimming', 'Swimming'),
        ('walking', 'Walking'),
        ('hiking', 'Hiking'),
        ('yoga', 'Yoga'),
        ('pushup', 'Push-up'),
        ('situp', 'Sit-up'),
        ('pullup', 'Pull-up'),
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
from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from models.activity_log import ActivityLog
from datetime import datetime, timedelta
import numpy as np

analytics = Blueprint('analytics', __name__)

@analytics.route('/api/activities', methods=['POST'])
@login_required
def get_activities():
    try:
        data = request.get_json()
        start_date = data.get('startDate')
        end_date = data.get('endDate')
        activity_type = data.get('activityType')
        
        # Build query
        query = ActivityLog.query.filter_by(user_id=current_user.id)
        
        if start_date:
            query = query.filter(ActivityLog.date >= start_date)
        if end_date:
            query = query.filter(ActivityLog.date <= end_date)
        if activity_type:
            query = query.filter(ActivityLog.activity_type == activity_type)
            
        activities = query.order_by(ActivityLog.date).all()
        
        # Calculate stats
        total_calories = sum(a.calories for a in activities)
        total_distance = sum(a.distance for a in activities)
        total_duration = sum(a.duration for a in activities)
        activity_count = len(activities)
        
        return jsonify({
            'activities': [{
                'id': a.id,
                'date': a.date.isoformat(),
                'activity_type': a.activity_type,
                'duration': a.duration,
                'distance': a.distance,
                'calories': a.calories,
                'intensity': a.intensity
            } for a in activities],
            'stats': {
                'total_calories': total_calories,
                'total_distance': total_distance,
                'total_duration': total_duration,
                'activity_count': activity_count
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics.route('/api/activities/export', methods=['POST'])
@login_required
def export_activities():
    try:
        data = request.get_json()
        format = data.get('format', 'json')
        start_date = data.get('startDate')
        end_date = data.get('endDate')
        
        # Build query
        query = ActivityLog.query.filter_by(user_id=current_user.id)
        
        if start_date:
            query = query.filter(ActivityLog.date >= start_date)
        if end_date:
            query = query.filter(ActivityLog.date <= end_date)
            
        activities = query.order_by(ActivityLog.date).all()
        
        # Format data based on export type
        if format == 'csv':
            # Convert to CSV format
            csv_data = "date,activity_type,duration,distance,calories,intensity\n"
            for activity in activities:
                csv_data += f"{activity.date},{activity.activity_type},{activity.duration},{activity.distance},{activity.calories},{activity.intensity}\n"
            return csv_data, 200, {'Content-Type': 'text/csv'}
        else:
            # Default to JSON
            return jsonify([{
                'date': a.date.isoformat(),
                'activity_type': a.activity_type,
                'duration': a.duration,
                'distance': a.distance,
                'calories': a.calories,
                'intensity': a.intensity
            } for a in activities])
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics.route('/api/analytics/predictions', methods=['POST'])
@login_required
def get_predictions():
    try:
        data = request.get_json()
        days = data.get('days', 30)  # Default to 30 days prediction
        
        # Get recent activities for prediction
        query = ActivityLog.query.filter_by(user_id=current_user.id)
        activities = query.order_by(ActivityLog.date.desc()).limit(100).all()
        
        if len(activities) < 2:
            return jsonify({'error': 'Not enough data for prediction'}), 400
            
        # Prepare data for prediction
        dates = [a.date for a in activities]
        calories = [a.calories for a in activities]
        
        # Simple linear regression
        x = np.array(range(len(calories)))
        y = np.array(calories)
        
        # Calculate regression coefficients
        slope, intercept = np.polyfit(x, y, 1)
        
        # Generate predictions
        predictions = []
        last_date = dates[-1]
        
        for i in range(1, days + 1):
            next_date = last_date + timedelta(days=i)
            predicted_calories = slope * (len(calories) + i) + intercept
            predictions.append({
                'date': next_date.isoformat(),
                'calories': max(0, predicted_calories)  # Ensure non-negative calories
            })
            
        return jsonify({
            'predictions': predictions,
            'trend': {
                'slope': slope,
                'intercept': intercept
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics.route('/api/analytics/trends', methods=['POST'])
@login_required
def get_trends():
    try:
        data = request.get_json()
        period = data.get('period', 'month')  # Default to monthly trends
        
        # Get activities based on period
        end_date = datetime.now()
        if period == 'week':
            start_date = end_date - timedelta(days=7)
        elif period == 'month':
            start_date = end_date - timedelta(days=30)
        else:  # year
            start_date = end_date - timedelta(days=365)
            
        query = ActivityLog.query.filter_by(user_id=current_user.id)
        query = query.filter(ActivityLog.date >= start_date)
        query = query.filter(ActivityLog.date <= end_date)
        
        activities = query.order_by(ActivityLog.date).all()
        
        # Calculate trends
        trends = {
            'calories': calculate_trend(activities, 'calories'),
            'distance': calculate_trend(activities, 'distance'),
            'duration': calculate_trend(activities, 'duration')
        }
        
        return jsonify(trends)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def calculate_trend(activities, metric):
    """Calculate trend for a specific metric"""
    if not activities:
        return {'slope': 0, 'intercept': 0, 'r_squared': 0}
        
    # Prepare data
    x = np.array(range(len(activities)))
    y = np.array([getattr(a, metric) for a in activities])
    
    # Calculate regression
    slope, intercept = np.polyfit(x, y, 1)
    
    # Calculate R-squared
    y_pred = slope * x + intercept
    ss_res = np.sum((y - y_pred) ** 2)
    ss_tot = np.sum((y - np.mean(y)) ** 2)
    r_squared = 1 - (ss_res / ss_tot) if ss_tot != 0 else 0
    
    return {
        'slope': float(slope),
        'intercept': float(intercept),
        'r_squared': float(r_squared)
    } 
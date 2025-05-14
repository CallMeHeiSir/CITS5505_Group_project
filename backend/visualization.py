from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
from collections import Counter, defaultdict
from models.activity_log import ActivityLog
from extensions import db
import numpy as np
import traceback
from flask_login import login_required, current_user

visualization = Blueprint('visualization', __name__)

@visualization.route('/activities', methods=['POST'])
@login_required
def get_visualization_data():
    try:
        data = request.get_json()
        print('前端传参:', data)
        start_date = datetime.strptime(data.get('startDate'), '%Y-%m-%d') if data.get('startDate') else None
        end_date = datetime.strptime(data.get('endDate'), '%Y-%m-%d') if data.get('endDate') else None
        activity_type = data.get('activityType')

        # 构建查询（加上用户隔离）
        query = ActivityLog.query.filter_by(user_id=current_user.id)
        if start_date:
            query = query.filter(ActivityLog.date >= start_date)
        if end_date:
            query = query.filter(ActivityLog.date <= end_date)
        if activity_type:
            query = query.filter(ActivityLog.activity_type == activity_type)

        activities = query.all()
        print('Found activities:', len(activities))
        if activities:
            print('Sample activity:', {
                'date': activities[0].date,
                'type': activities[0].activity_type,
                'duration': activities[0].duration,
                'distance': activities[0].distance,
                'calories': activities[0].calories
            })

        # 处理数据用于可视化
        visualization_data = {
            'weekly_data': process_weekly_data(activities),
            'progress_data': process_progress_data(activities),
            'activity_distribution': process_activity_distribution(activities),
            'calories_trend': process_calories_trend(activities),
            'stats': calculate_stats(activities),
            'activities': [
                {
                    'id': a.id,
                    'user_id': a.user_id,
                    'activity_type': a.activity_type,
                    'date': a.date.strftime('%Y-%m-%d'),
                    'duration': a.duration,
                    'distance': a.distance,
                    'calories': a.calories,
                    'height': a.height,
                    'weight': a.weight,
                    'age': a.age,
                    'location': a.location
                } for a in activities
            ]
        }

        print('Sending visualization data:', {
            'weekly_data_count': len(visualization_data['weekly_data']['labels']),
            'progress_data_count': len(visualization_data['progress_data']['labels']),
            'activity_distribution_count': len(visualization_data['activity_distribution']['labels']),
            'calories_trend_count': len(visualization_data['calories_trend']['labels'])
        })

        return jsonify(visualization_data)

    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 400

def process_weekly_data(activities):
    """处理每周活动数据"""
    weekly_data = defaultdict(lambda: {'duration': 0, 'distance': 0, 'calories': 0})
    
    for activity in activities:
        date = activity.date
        week_start = date - timedelta(days=date.weekday())
        week_key = week_start.strftime('%Y-%m-%d')
        
        weekly_data[week_key]['duration'] += activity.duration or 0
        weekly_data[week_key]['distance'] += activity.distance or 0
        weekly_data[week_key]['calories'] += activity.calories or 0

    # 确保数据按日期排序
    sorted_weeks = sorted(weekly_data.keys())
    
    result = {
        'labels': sorted_weeks,
        'duration': [weekly_data[week]['duration'] for week in sorted_weeks],
        'distance': [weekly_data[week]['distance'] for week in sorted_weeks],
        'calories': [weekly_data[week]['calories'] for week in sorted_weeks]
    }
    print('Weekly data:', result)
    return result

def process_progress_data(activities):
    """处理进度数据"""
    progress_data = defaultdict(lambda: {'distance': 0, 'duration': 0})
    
    for activity in activities:
        date = activity.date
        month_key = date.strftime('%Y-%m')
        
        progress_data[month_key]['distance'] += activity.distance or 0
        progress_data[month_key]['duration'] += activity.duration or 0

    # 确保数据按月份排序
    sorted_months = sorted(progress_data.keys())
    
    result = {
        'labels': sorted_months,
        'distance': [progress_data[month]['distance'] for month in sorted_months],
        'duration': [progress_data[month]['duration'] for month in sorted_months]
    }
    print('Progress data:', result)
    return result

def process_activity_distribution(activities):
    """处理活动类型分布"""
    activity_types = Counter(activity.activity_type for activity in activities)
    
    # 确保至少有一个活动类型
    if not activity_types:
        return {
            'labels': ['No Activities'],
            'data': [1]
        }
    
    result = {
        'labels': list(activity_types.keys()),
        'data': list(activity_types.values())
    }
    print('Activity distribution:', result)
    return result

def process_calories_trend(activities):
    """处理卡路里趋势"""
    calories_data = defaultdict(int)
    
    for activity in activities:
        date = activity.date
        date_key = date.strftime('%Y-%m-%d')
        calories_data[date_key] += activity.calories or 0

    # 确保数据按日期排序
    sorted_dates = sorted(calories_data.keys())
    
    result = {
        'labels': sorted_dates,
        'data': [calories_data[date] for date in sorted_dates]
    }
    print('Calories trend:', result)
    return result

def calculate_stats(activities):
    """计算统计数据"""
    if not activities:
        return {
            'total_duration': 0,
            'total_distance': 0,
            'total_calories': 0,
            'avg_duration': 0,
            'avg_distance': 0,
            'avg_calories': 0,
            'count': 0
        }

    total_duration = sum(activity.duration or 0 for activity in activities)
    total_distance = sum(activity.distance or 0 for activity in activities)
    total_calories = sum(activity.calories or 0 for activity in activities)
    count = len(activities)

    return {
        'total_duration': total_duration,
        'total_distance': total_distance,
        'total_calories': total_calories,
        'avg_duration': total_duration / count,
        'avg_distance': total_distance / count,
        'avg_calories': total_calories / count,
        'count': count
    } 
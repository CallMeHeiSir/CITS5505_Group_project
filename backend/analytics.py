from flask import Blueprint, jsonify, request, current_app
from flask_login import login_required, current_user
from models.activity_log import ActivityLog
from datetime import datetime, timedelta
import numpy as np
from extensions import db
import pandas as pd
import os
import csv
import io

analytics = Blueprint('analytics', __name__)

@analytics.route('/api/activities/summary', methods=['GET'])
@login_required
def get_activities_summary():
    try:
        data = request.args
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

@analytics.route('/api/activities/add', methods=['POST'])
@login_required
def add_activity():
    try:
        data = request.get_json()
        
        # 验证日期
        try:
            activity_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
            today = datetime.now().date()
            if activity_date > today:
                return jsonify({
                    'status': 'error',
                    'message': 'Cannot add activities for future dates'
                }), 400
        except ValueError:
            return jsonify({
                'status': 'error',
                'message': 'Invalid date format. Please use YYYY-MM-DD'
            }), 400
        
        # 创建新的活动记录
        activity = ActivityLog(
            user_id=current_user.id,
            activity_type=data['activityType'],
            date=activity_date,
            duration=int(data['duration']),
            distance=float(data['distance']) if data['distance'] else None,
            reps=int(data['reps']) if data['reps'] else None,
            height=int(data['height']),
            weight=int(data['weight']),
            age=int(data['age']),
            location=data['location']
        )
        
        # 计算卡路里
        activity.calories = activity.calculate_calories()
        
        # 保存到数据库
        db.session.add(activity)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Activity added successfully',
            'calories': activity.calories
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

@analytics.route('/api/activities/upload', methods=['POST'])
@login_required
def upload_activities():
    try:
        print("Received file upload request")
        if 'file' not in request.files:
            print("No file in request")
            return jsonify({
                'status': 'error',
                'message': 'No file uploaded'
            }), 400
            
        file = request.files['file']
        print(f"Received file: {file.filename}")
        
        if file.filename == '':
            print("Empty filename")
            return jsonify({
                'status': 'error',
                'message': 'No file selected'
            }), 400
            
        if not file.filename.endswith('.csv'):
            print("Invalid file type")
            return jsonify({
                'status': 'error',
                'message': 'Only CSV files are allowed'
            }), 400
            
        # 读取CSV文件
        print("Reading CSV file")
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        csv_reader = csv.DictReader(stream)
        
        # 验证必要的列是否存在
        required_columns = ['activity_type', 'date', 'duration', 'height', 'weight', 'age', 'location']
        if not csv_reader.fieldnames:
            return jsonify({
                'status': 'error',
                'message': 'Empty CSV file'
            }), 400
            
        missing_columns = [col for col in required_columns if col not in csv_reader.fieldnames]
        if missing_columns:
            print(f"Missing columns: {missing_columns}")
            return jsonify({
                'status': 'error',
                'message': f'Missing required columns: {", ".join(missing_columns)}'
            }), 400
            
        # 处理每一行数据
        print("Processing rows")
        activities = []
        row_number = 1
        skipped_rows = 0
        
        for row in csv_reader:
            row_number += 1
            
            # 跳过空行
            if all(not value or value.strip() == '' for value in row.values()):
                print(f"Skipping empty row {row_number}")
                skipped_rows += 1
                continue
                
            try:
                # 验证必填字段
                for field in required_columns:
                    if not row.get(field) or row[field].strip() == '':
                        raise ValueError(f"Missing required field: {field}")
                
                # 验证日期格式
                try:
                    date = datetime.strptime(row['date'], '%Y-%m-%d').date()
                except ValueError:
                    raise ValueError(f"Invalid date format: {row['date']}. Expected format: YYYY-MM-DD")
                
                # 验证数值字段
                try:
                    duration = int(row['duration'])
                    if duration <= 0:
                        raise ValueError("Duration must be greater than 0")
                except ValueError:
                    raise ValueError(f"Invalid duration: {row['duration']}. Must be a positive integer")
                
                try:
                    height = int(row['height'])
                    if height <= 0:
                        raise ValueError("Height must be greater than 0")
                except ValueError:
                    raise ValueError(f"Invalid height: {row['height']}. Must be a positive integer")
                
                try:
                    weight = int(row['weight'])
                    if weight <= 0:
                        raise ValueError("Weight must be greater than 0")
                except ValueError:
                    raise ValueError(f"Invalid weight: {row['weight']}. Must be a positive integer")
                
                try:
                    age = int(row['age'])
                    if age <= 0 or age > 120:
                        raise ValueError("Age must be between 1 and 120")
                except ValueError:
                    raise ValueError(f"Invalid age: {row['age']}. Must be a positive integer between 1 and 120")
                
                # 验证可选字段
                distance = None
                if row.get('distance') and row['distance'].strip():
                    try:
                        distance = float(row['distance'])
                        if distance < 0:
                            raise ValueError("Distance cannot be negative")
                    except ValueError:
                        raise ValueError(f"Invalid distance: {row['distance']}. Must be a non-negative number")
                
                reps = None
                if row.get('reps') and row['reps'].strip():
                    try:
                        reps = int(row['reps'])
                        if reps < 0:
                            raise ValueError("Reps cannot be negative")
                    except ValueError:
                        raise ValueError(f"Invalid reps: {row['reps']}. Must be a non-negative integer")
                
                activity = ActivityLog(
                    user_id=current_user.id,
                    activity_type=row['activity_type'],
                    date=date,
                    duration=duration,
                    distance=distance,
                    reps=reps,
                    height=height,
                    weight=weight,
                    age=age,
                    location=row['location']
                )
                
                # 计算卡路里
                activity.calories = activity.calculate_calories()
                activities.append(activity)
                
            except ValueError as e:
                print(f"Error processing row {row_number}: {row}, Error: {str(e)}")
                return jsonify({
                    'status': 'error',
                    'message': f'Error in row {row_number}: {str(e)}'
                }), 400
            
        # 检查是否有有效数据
        if not activities:
            return jsonify({
                'status': 'error',
                'message': 'No valid data found in the file'
            }), 400
            
        # 批量保存到数据库
        print(f"Saving {len(activities)} activities to database")
        db.session.bulk_save_objects(activities)
        db.session.commit()
        
        # 构建成功消息
        success_message = f'Successfully uploaded {len(activities)} activities'
        if skipped_rows > 0:
            success_message += f' (skipped {skipped_rows} empty rows)'
            
        print("Upload completed successfully")
        return jsonify({
            'status': 'success',
            'message': success_message
        }), 201
        
    except Exception as e:
        print(f"Error during upload: {str(e)}")
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400 
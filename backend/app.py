import os
from datetime import datetime
from flask import Flask, request, jsonify, send_file
from werkzeug.utils import secure_filename
from models import db, User, Activity, Upload
from config import Config
import pandas as pd
import json

app = Flask(__name__)
app.config.from_object(Config)

# 初始化数据库
db.init_app(app)

# 确保上传文件夹存在
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400
    
    try:
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # 创建上传记录
        upload = Upload(
            user_id=1,  # 临时使用固定用户ID
            filename=filename,
            file_type=filename.rsplit('.', 1)[1].lower(),
            file_size=os.path.getsize(file_path),
            status='success'
        )
        
        # 解析文件数据
        activities = parse_file(file_path, filename)
        if activities:
            db.session.add(upload)
            db.session.add_all(activities)
            db.session.commit()
            return jsonify({'message': 'File uploaded successfully', 'activities': len(activities)}), 200
        else:
            upload.status = 'failed'
            upload.error_message = 'Failed to parse file'
            db.session.add(upload)
            db.session.commit()
            return jsonify({'error': 'Failed to parse file'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def parse_file(file_path, filename):
    file_type = filename.rsplit('.', 1)[1].lower()
    activities = []
    
    try:
        if file_type == 'csv':
            df = pd.read_csv(file_path)
        elif file_type == 'json':
            with open(file_path) as f:
                data = json.load(f)
            df = pd.DataFrame(data)
        else:  # txt
            df = pd.read_csv(file_path, delimiter='\t')
        
        for _, row in df.iterrows():
            activity = Activity(
                user_id=1,  # 临时使用固定用户ID
                activity_type=row.get('activity_type', 'unknown'),
                duration=row.get('duration', 0),
                distance=row.get('distance', 0.0),
                calories=row.get('calories', 0),
                date=datetime.strptime(row.get('date', datetime.now().strftime('%Y-%m-%d')), '%Y-%m-%d')
            )
            activities.append(activity)
        
        return activities
    except Exception as e:
        print(f"Error parsing file: {str(e)}")
        return None

@app.route('/api/activities', methods=['POST'])
def add_activity():
    data = request.json
    
    try:
        activity = Activity(
            user_id=1,  # 临时使用固定用户ID
            activity_type=data['activity_type'],
            duration=data['duration'],
            distance=data['distance'],
            calories=data['calories'],
            date=datetime.strptime(data['date'], '%Y-%m-%d')
        )
        
        db.session.add(activity)
        db.session.commit()
        
        return jsonify({'message': 'Activity added successfully', 'activity': activity.to_dict()}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/activities', methods=['GET'])
def get_activities():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    activity_type = request.args.get('activity_type')
    limit = request.args.get('limit', type=int)
    
    query = Activity.query
    
    if start_date:
        query = query.filter(Activity.date >= datetime.strptime(start_date, '%Y-%m-%d'))
    if end_date:
        query = query.filter(Activity.date <= datetime.strptime(end_date, '%Y-%m-%d'))
    if activity_type:
        query = query.filter(Activity.activity_type == activity_type)
    
    query = query.order_by(Activity.date.desc())
    
    if limit:
        query = query.limit(limit)
    
    activities = query.all()
    return jsonify([activity.to_dict() for activity in activities])

@app.route('/api/activities/stats', methods=['GET'])
def get_activity_stats():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    query = Activity.query
    
    if start_date:
        query = query.filter(Activity.date >= datetime.strptime(start_date, '%Y-%m-%d'))
    if end_date:
        query = query.filter(Activity.date <= datetime.strptime(end_date, '%Y-%m-%d'))
    
    activities = query.all()
    
    stats = {
        'total_distance': sum(a.distance or 0 for a in activities),
        'total_duration': sum(a.duration or 0 for a in activities),
        'total_calories': sum(a.calories or 0 for a in activities),
        'activity_count': len(activities),
        'activity_types': {}
    }
    
    for activity in activities:
        if activity.activity_type not in stats['activity_types']:
            stats['activity_types'][activity.activity_type] = 0
        stats['activity_types'][activity.activity_type] += 1
    
    return jsonify(stats)

@app.route('/api/export/<format>', methods=['GET'])
def export_data(format):
    if format not in ['csv', 'json']:
        return jsonify({'error': 'Invalid format'}), 400
    
    activities = Activity.query.order_by(Activity.date.desc()).all()
    data = [activity.to_dict() for activity in activities]
    
    if format == 'csv':
        df = pd.DataFrame(data)
        output = df.to_csv(index=False)
        return send_file(
            output,
            mimetype='text/csv',
            as_attachment=True,
            download_name='fitness_data.csv'
        )
    else:  # json
        return jsonify(data)

@app.route('/api/uploads', methods=['GET'])
def get_uploads():
    uploads = Upload.query.order_by(Upload.created_at.desc()).all()
    return jsonify([upload.to_dict() for upload in uploads])

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True) 
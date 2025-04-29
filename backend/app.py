import os
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from models import db, User, Activity, Upload
from config import Config
from auth import auth
import pandas as pd
import json

app = Flask(__name__)
app.config.from_object(Config)

# 配置CORS
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Authorization", "Content-Type"]
    }
})

# 初始化扩展
db.init_app(app)
jwt = JWTManager(app)

# 注册蓝图
app.register_blueprint(auth, url_prefix='/api/auth')

# 确保上传文件夹存在
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# 创建数据库表
with app.app_context():
    db.create_all()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/api/upload', methods=['POST'])
@jwt_required()
def upload_file():
    current_user_id = get_jwt_identity()
    
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
            user_id=current_user_id,
            filename=filename,
            file_type=filename.rsplit('.', 1)[1].lower(),
            file_size=os.path.getsize(file_path),
            status='success'
        )
        
        # 解析文件数据
        activities = parse_file(file_path, filename, current_user_id)
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

def parse_file(file_path, filename, user_id):
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
                user_id=user_id,
                activity_type=row.get('activity_type', 'unknown'),
                duration=row.get('duration', 0),
                distance=row.get('distance', 0.0),
                calories=row.get('calories', 0),
                date=datetime.strptime(row.get('date', datetime.now().strftime('%Y-%m-%d')), '%Y-%m-%d').date()
            )
            activities.append(activity)
        
        return activities
    except Exception as e:
        print(f"Error parsing file: {str(e)}")
        return None

@app.route('/api/activities', methods=['POST'])
@jwt_required()
def add_activity():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # 验证必需字段
        required_fields = ['activity_type', 'duration', 'date']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
            
        # 创建新活动
        new_activity = Activity(
            user_id=current_user_id,
            activity_type=data['activity_type'],
            duration=data['duration'],
            distance=data.get('distance'),
            calories=data.get('calories'),
            date=datetime.strptime(data['date'], '%Y-%m-%d').date()
        )
        
        db.session.add(new_activity)
        db.session.commit()
        
        return jsonify(new_activity.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/activities', methods=['GET'])
@jwt_required()
def get_activities():
    try:
        current_user_id = get_jwt_identity()
        activities = Activity.query.filter_by(user_id=current_user_id).all()
        return jsonify([activity.to_dict() for activity in activities])
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/activities/stats', methods=['GET'])
@jwt_required()
def get_activity_stats():
    try:
        current_user_id = get_jwt_identity()
        
        # 获取过去7天的活动
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=6)
        
        activities = Activity.query.filter(
            Activity.user_id == current_user_id,
            Activity.date >= start_date,
            Activity.date <= end_date
        ).all()
        
        # 计算统计数据
        total_duration = sum(a.duration for a in activities)
        total_distance = sum(a.distance or 0 for a in activities)
        total_calories = sum(a.calories or 0 for a in activities)
        
        # 按活动类型分组
        activity_types = {}
        for activity in activities:
            if activity.activity_type not in activity_types:
                activity_types[activity.activity_type] = 0
            activity_types[activity.activity_type] += 1
        
        return jsonify({
            'total_duration': total_duration,
            'total_distance': total_distance,
            'total_calories': total_calories,
            'activity_count': len(activities),
            'activity_types': activity_types
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/activities/export', methods=['GET'])
@jwt_required()
def export_data():
    try:
        current_user_id = get_jwt_identity()
        activities = Activity.query.filter_by(user_id=current_user_id).all()
        
        if not activities:
            return jsonify({'error': 'No data found'}), 404
            
        # 转换为DataFrame
        data = [activity.to_dict() for activity in activities]
        df = pd.DataFrame(data)
        
        # 导出为CSV
        csv_file = f'activities_export_{current_user_id}.csv'
        df.to_csv(csv_file, index=False)
        
        return send_file(
            csv_file,
            mimetype='text/csv',
            as_attachment=True,
            download_name=csv_file
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/uploads', methods=['GET'])
@jwt_required()
def get_uploads():
    try:
        current_user_id = get_jwt_identity()
        uploads = Upload.query.filter_by(user_id=current_user_id).order_by(Upload.created_at.desc()).all()
        return jsonify([upload.to_dict() for upload in uploads])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok'}), 200

@app.errorhandler(404)
def not_found_error(error):
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8081) 
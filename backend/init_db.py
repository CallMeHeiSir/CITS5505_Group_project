from app import app, db
from models import User, Activity
from datetime import datetime

def init_db():
    with app.app_context():
        # 创建所有表
        db.create_all()
        
        # 创建测试用户
        if User.query.filter_by(username='test_user').first() is None:
            user = User(username='test_user', email='test@example.com')
            user.set_password('test123')
            db.session.add(user)
            db.session.commit()
            
            # 添加一些测试活动数据
            test_activities = [
                Activity(
                    user_id=user.id,
                    activity_type='running',
                    duration=30,
                    distance=5.0,
                    calories=300,
                    date=datetime.strptime('2024-04-20', '%Y-%m-%d').date()
                ),
                Activity(
                    user_id=user.id,
                    activity_type='cycling',
                    duration=45,
                    distance=15.0,
                    calories=400,
                    date=datetime.strptime('2024-04-21', '%Y-%m-%d').date()
                ),
                Activity(
                    user_id=user.id,
                    activity_type='swimming',
                    duration=60,
                    distance=2.0,
                    calories=500,
                    date=datetime.strptime('2024-04-22', '%Y-%m-%d').date()
                )
            ]
            db.session.add_all(test_activities)
            db.session.commit()
            print('Database initialized with test data!')
        else:
            print('Test user already exists.')

if __name__ == '__main__':
    init_db() 
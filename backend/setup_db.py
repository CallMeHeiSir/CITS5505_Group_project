from app import create_app, db
from models.user import User
from models.activity_log import ActivityLog
from models.verification_code import VerificationCode
from models.share import Share, ShareRecipient
from sqlalchemy import select
from datetime import datetime, date
import os

app = create_app()

def create_test_user(username, email, password, **kwargs):
    user = User(
        username=username,
        email=email,
        **kwargs
    )
    user.set_password(password)
    return user

with app.app_context():
    # 创建所有表
    db.create_all()
    
    # 创建测试用户列表
    test_users = [
        {
            'username': 'john_doe',
            'email': 'john@example.com',
            'password': 'test123',
            'phone': '1234567890',
            'gender': 'male',
            'birthdate': date(1990, 1, 15),
            'address': 'Perth, WA'
        },
        {
            'username': 'emma_wilson',
            'email': 'emma@example.com',
            'password': 'test123',
            'phone': '0987654321',
            'gender': 'female',
            'birthdate': date(1995, 5, 20),
            'address': 'Sydney, NSW'
        },
        {
            'username': 'alex_smith',
            'email': 'alex@example.com',
            'password': 'test123',
            'phone': '5555555555',
            'gender': 'male',
            'birthdate': date(1988, 8, 8),
            'address': 'Melbourne, VIC'
        },
        {
            'username': 'sarah_brown',
            'email': 'sarah@example.com',
            'password': 'test123',
            'phone': '4444444444',
            'gender': 'female',
            'birthdate': date(1992, 12, 25),
            'address': 'Brisbane, QLD'
        },
        {
            'username': 'mike_jones',
            'email': 'mike@example.com',
            'password': 'test123',
            'phone': '3333333333',
            'gender': 'male',
            'birthdate': date(1985, 3, 30),
            'address': 'Adelaide, SA'
        }
    ]
    
    try:
        # 检查并添加测试用户
        for user_data in test_users:
            if User.query.filter_by(username=user_data['username']).first() is None:
                user = create_test_user(**user_data)
                db.session.add(user)
                print(f"Created test user: {user_data['username']}")
        
        # 提交更改
        db.session.commit()
        print("Successfully created all test users")
        
    except Exception as e:
        db.session.rollback()
        print(f"Error creating test users: {e}")
    
    print("Database setup completed") 
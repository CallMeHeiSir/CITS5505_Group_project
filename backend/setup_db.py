from app import create_app, db
from models.user import User
from models.activity_log import ActivityLog
from models.verification_code import VerificationCode
from models.share import Share, ShareRecipient
from sqlalchemy import select
import os

app = create_app()

with app.app_context():
    # 创建所有表
    db.create_all()
    
    # 检查是否需要创建测试用户
    if User.query.filter_by(username='testuser').first() is None:
        # 创建测试用户
        test_user = User(
            username='testuser',
            email='test@example.com'
        )
        test_user.set_password('testpass')
        
        # 创建第二个测试用户（用于测试好友功能）
        test_user2 = User(
            username='testuser2',
            email='test2@example.com'
        )
        test_user2.set_password('testpass')
        
        # 添加用户到数据库
        db.session.add(test_user)
        db.session.add(test_user2)
        
        # 建立好友关系
        test_user.add_friend(test_user2)
        
        try:
            db.session.commit()
            print("Created test users and established friendship")
        except Exception as e:
            db.session.rollback()
            print(f"Error creating test users: {e}")
    
    print("Database setup completed") 
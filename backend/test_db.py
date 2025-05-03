from app import create_app, db
from models.user import User
import os

app = create_app()

with app.app_context():
    # 创建数据库表
    db.create_all()
    
    # 检查是否已存在测试用户
    test_user = User.query.filter_by(username='test').first()
    if not test_user:
        # 创建测试用户
        user = User(username='test', email='test@example.com')
        # 从环境变量读取测试用户密码
        test_password = os.getenv('TEST_USER_PASSWORD')
        if not test_password:
            raise ValueError("TEST_USER_PASSWORD environment variable is not set")
        user.set_password(test_password)
        db.session.add(user)
        db.session.commit()
        print('Test user created successfully!')
    else:
        print('Test user already exists!') 
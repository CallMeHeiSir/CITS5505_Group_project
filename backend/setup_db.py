from app import create_app, db
from models.user import User
from models.friendship import Friendship  # 修正导入
from sqlalchemy import select
import os

app = create_app()

with app.app_context():
    # 创建数据库表
    db.create_all()
    
    # 检查是否已存在初始用户
    stmt = select(User).where(User.username == 'test')
    test_user = db.session.execute(stmt).scalar_one_or_none()
    
    if not test_user:
        # 创建初始用户
        user = User(username='test', email='test@example.com')
        # 从环境变量读取用户密码
        test_password = os.getenv('TEST_USER_PASSWORD')
        if not test_password:
            raise ValueError("TEST_USER_PASSWORD environment variable is not set")
        user.set_password(test_password)
        db.session.add(user)
        db.session.commit()
        print('Initial user created successfully!')
    else:
        print('Initial user already exists!') 
from app import create_app, db
from models.user import User

from models.friend import FriendRequest, Friendship  # Import friend models

from sqlalchemy import select
import os

app = create_app()

with app.app_context():
    # Create database tables
    db.create_all()
    
    # Check if initial user already exists
    stmt = select(User).where(User.username == 'test')
    test_user = db.session.execute(stmt).scalar_one_or_none()
    
    if not test_user:
        # Create initial user
        user = User(username='test', email='test@example.com')
        # Read user password from environment variable
        test_password = os.getenv('TEST_USER_PASSWORD')
        if not test_password:
            raise ValueError("TEST_USER_PASSWORD environment variable is not set")
        user.set_password(test_password)
        db.session.add(user)
        db.session.commit()
        print('Initial user created successfully!')
    else:
        print('Initial user already exists!')
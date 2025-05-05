from app import create_app, db
from models.user import User
from sqlalchemy import select

app = create_app()

with app.app_context():
    # 查询所有用户
    stmt = select(User)
    users = db.session.execute(stmt).scalars().all()
    
    print("\nAll Users:")
    print("-" * 50)
    for user in users:
        print(f"Username: {user.username}")
        print(f"Email: {user.email}")
        print(f"Created at: {user.created_at}")
        print("-" * 50) 
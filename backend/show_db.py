from app import create_app, db
from models.user import User

app = create_app()

with app.app_context():
    # 查询所有用户
    users = User.query.all()
    print("\nAll Users:")
    print("-" * 50)
    for user in users:
        print(f"Username: {user.username}")
        print(f"Email: {user.email}")
        print(f"Created at: {user.created_at}")
        print("-" * 50) 
from app import create_app, db
from models.user import User
from models.activity_log import ActivityLog
from sqlalchemy import select

app = create_app()

with app.app_context():
    # 查询所有用户
    stmt = select(User)
    users = db.session.execute(stmt).scalars().all()
    
    print("\nAll Users:")
    print("-" * 100)
    for user in users:
        print(f"ID: {user.id}")
        print(f"Username: {user.username}")
        print(f"Email: {user.email}")
        print(f"Phone: {user.phone}")
        print(f"Gender: {user.gender}")
        print(f"Birthdate: {user.birthdate}")
        print(f"Address: {user.address}")
        print(f"Avatar: {user.avatar}")
        print(f"Created at: {user.created_at if user.created_at else 'Not set'}")
        print("-" * 100)

    # 查询所有活动日志
    stmt = select(ActivityLog)
    logs = db.session.execute(stmt).scalars().all()
    
    print("\nAll Activity Logs:")
    print("-" * 100)
    for log in logs:
        print(f"ID: {log.id}")
        print(f"User ID: {log.user_id}")
        print(f"Activity Type: {log.activity_type}")
        print(f"Date: {log.date}")
        print(f"Duration: {log.duration}")
        print(f"Distance: {log.distance}")
        print(f"Reps: {log.reps}")
        print(f"Calories: {log.calories}")
        print(f"Height: {log.height}")
        print(f"Weight: {log.weight}")
        print(f"Age: {log.age}")
        print(f"Location: {log.location}")
        print(f"Created at: {log.created_at if log.created_at else 'Not set'}")
        print("-" * 100) 
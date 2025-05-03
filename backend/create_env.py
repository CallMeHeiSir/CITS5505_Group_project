with open('.env', 'w', encoding='utf-8') as f:
    f.write('''FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=dev-secret-key
DATABASE_URL=sqlite:///app.db
''') 
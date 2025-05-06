from flask import Flask, render_template, session, redirect, url_for
from config import Config
from routes.auth import auth_bp
from routes.upload import upload_bp
from database import init_db
import os

app = Flask(__name__)
app.config.from_object(Config)

# 确保上传文件夹存在
if not os.path.exists(Config.UPLOAD_FOLDER):
    os.makedirs(Config.UPLOAD_FOLDER)

# 初始化数据库
init_db()

# 注册 API 蓝图
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(upload_bp, url_prefix='/api')

# 路由：首页（需要登录）
@app.route('/')
def index():
    if 'user_id' not in session:
        return redirect(url_for('login_page'))
    return render_template('index.html')

# 路由：登录页面
@app.route('/login')
def login_page():
    if 'user_id' in session:
        return redirect(url_for('index'))
    return render_template('login.html')

# 路由：注册页面
@app.route('/register')
def register_page():
    if 'user_id' in session:
        return redirect(url_for('index'))
    return render_template('register.html')

# 404 错误处理
@app.errorhandler(404)
def not_found(error):
    return {'error': '资源未找到'}, 404

if __name__ == '__main__':
    app.run(debug=True)
# Fitness Dashboard Backend

这是Fitness Dashboard项目的后端部分，使用Flask框架开发。

## 功能特性

- 用户认证（注册、登录、个人资料管理）
- 活动管理（添加、查看、统计、导出）
- 文件上传（支持CSV、JSON、TXT格式）
- JWT认证保护
- 数据可视化支持

## 技术栈

- Python 3.8+
- Flask 3.0.2
- SQLAlchemy 2.0.28
- Flask-JWT-Extended 4.6.0
- Pandas 2.2.1

## 安装步骤

1. 创建虚拟环境：
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

2. 安装依赖：
```bash
pip install -r requirements.txt
```

3. 创建环境变量文件：
创建一个`.env`文件，包含以下内容：
```
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
```

4. 初始化数据库：
```bash
python init_db.py
```

## 运行项目

```bash
flask run
```

服务器将在 http://localhost:5000 启动

## API端点

### 认证相关
- POST /api/auth/register - 用户注册
- POST /api/auth/login - 用户登录
- GET /api/auth/profile - 获取用户资料
- PUT /api/auth/profile - 更新用户资料

### 活动相关
- GET /api/activities - 获取活动列表
- POST /api/activities - 添加新活动
- GET /api/activities/stats - 获取活动统计
- GET /api/activities/export - 导出活动数据

### 文件上传
- POST /api/upload - 上传活动数据文件
- GET /api/uploads - 获取上传历史

## 数据格式

### 活动数据格式（CSV/JSON）
```
activity_type,duration,distance,calories,date
running,30,5.0,300,2024-04-20
cycling,45,15.0,400,2024-04-21
```

## 开发说明

- 所有API请求（除了注册和登录）都需要在请求头中包含JWT令牌：
```
Authorization: Bearer <access_token>
```

- 文件上传大小限制为5MB
- 支持的文件类型：CSV、JSON、TXT 
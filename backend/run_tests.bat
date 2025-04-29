@echo off
echo 正在启动测试...

REM 激活虚拟环境（如果存在）
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
)

REM 安装依赖
pip install -r requirements.txt

REM 确保数据库已初始化
python init_db.py

REM 在后台启动Flask应用
start /B python app.py

REM 等待服务器启动
timeout /t 5

REM 运行测试
python test_api.py

REM 完成后暂停
pause 
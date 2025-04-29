import requests
import json
from datetime import datetime, timedelta
import random
import time
import sys
import os

BASE_URL = 'http://localhost:8081/api'
MAX_RETRIES = 3
RETRY_DELAY = 2  # 秒

def wait_for_server():
    print("等待服务器启动...")
    for i in range(MAX_RETRIES):
        try:
            response = requests.get(f"{BASE_URL}/auth/health")
            if response.status_code == 200:
                print("服务器已就绪！")
                return True
        except requests.exceptions.ConnectionError:
            print(f"服务器未就绪，重试 {i + 1}/{MAX_RETRIES}...")
            time.sleep(RETRY_DELAY)
    print("无法连接到服务器，请确保Flask应用已启动")
    return False

def make_request(method, endpoint, **kwargs):
    """统一的请求处理函数，包含重试逻辑"""
    for i in range(MAX_RETRIES):
        try:
            response = requests.request(method, f"{BASE_URL}/{endpoint}", **kwargs)
            return response
        except requests.exceptions.ConnectionError as e:
            if i == MAX_RETRIES - 1:
                raise e
            print(f"请求失败，重试 {i + 1}/{MAX_RETRIES}...")
            time.sleep(RETRY_DELAY)

def test_register():
    print("\n=== 测试用户注册 ===")
    username = f"testuser_{random.randint(1000, 9999)}"
    data = {
        "username": username,
        "email": f"{username}@example.com",
        "password": "test123"
    }
    try:
        response = make_request('POST', 'auth/register', json=data)
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.json()}")
        return response.json(), username
    except Exception as e:
        print(f"注册失败: {str(e)}")
        sys.exit(1)

def test_login(username):
    print("\n=== 测试用户登录 ===")
    data = {
        "username": username,
        "password": "test123"
    }
    try:
        response = make_request('POST', 'auth/login', json=data)
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.json()}")
        return response.json().get('access_token')
    except Exception as e:
        print(f"登录失败: {str(e)}")
        return None

def test_profile(token):
    print("\n=== 测试获取用户资料 ===")
    headers = {'Authorization': f'Bearer {token}'}
    try:
        response = make_request('GET', 'auth/profile', headers=headers)
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.json()}")
    except Exception as e:
        print(f"获取资料失败: {str(e)}")

def test_add_activity(token):
    print("\n=== 测试添加活动 ===")
    headers = {'Authorization': f'Bearer {token}'}
    data = {
        "activity_type": "running",
        "duration": 30,
        "distance": 5.0,
        "calories": 300,
        "date": datetime.now().strftime('%Y-%m-%d')
    }
    try:
        response = make_request('POST', 'activities', json=data, headers=headers)
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.json()}")
    except Exception as e:
        print(f"添加活动失败: {str(e)}")

def test_get_activities(token):
    print("\n=== 测试获取活动列表 ===")
    headers = {'Authorization': f'Bearer {token}'}
    try:
        response = make_request('GET', 'activities', headers=headers)
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.json()}")
    except Exception as e:
        print(f"获取活动列表失败: {str(e)}")

def test_activity_stats(token):
    print("\n=== 测试获取活动统计 ===")
    headers = {'Authorization': f'Bearer {token}'}
    try:
        response = make_request('GET', 'activities/stats', headers=headers)
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.json()}")
    except Exception as e:
        print(f"获取活动统计失败: {str(e)}")

def test_file_upload(token):
    print("\n=== 测试文件上传 ===")
    headers = {'Authorization': f'Bearer {token}'}
    
    try:
        # 创建测试CSV文件
        with open('test_activities.csv', 'w') as f:
            f.write("activity_type,duration,distance,calories,date\n")
            f.write("running,30,5.0,300,2024-04-20\n")
            f.write("cycling,45,15.0,400,2024-04-21\n")
        
        files = {'file': ('test_activities.csv', open('test_activities.csv', 'rb'), 'text/csv')}
        response = make_request('POST', 'upload', headers=headers, files=files)
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.json()}")
    except Exception as e:
        print(f"文件上传失败: {str(e)}")
    finally:
        # 清理测试文件
        try:
            os.remove('test_activities.csv')
        except:
            pass

def test_get_uploads(token):
    print("\n=== 测试获取上传历史 ===")
    headers = {'Authorization': f'Bearer {token}'}
    try:
        response = make_request('GET', 'uploads', headers=headers)
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.json()}")
    except Exception as e:
        print(f"获取上传历史失败: {str(e)}")

def test_export_activities(token):
    print("\n=== 测试导出活动数据 ===")
    headers = {'Authorization': f'Bearer {token}'}
    try:
        response = make_request('GET', 'activities/export', headers=headers)
        print(f"状态码: {response.status_code}")
        if response.status_code == 200:
            with open('exported_activities.csv', 'wb') as f:
                f.write(response.content)
            print("文件已导出到 exported_activities.csv")
    except Exception as e:
        print(f"导出活动数据失败: {str(e)}")

def main():
    if not wait_for_server():
        return

    try:
        # 测试注册
        register_response, username = test_register()
        
        # 测试登录并获取token
        token = test_login(username)
        
        if token:
            # 测试其他功能
            test_profile(token)
            test_add_activity(token)
            test_get_activities(token)
            test_activity_stats(token)
            test_file_upload(token)
            test_get_uploads(token)
            test_export_activities(token)
        else:
            print("登录失败，无法继续测试")
    except Exception as e:
        print(f"测试过程中出现错误: {str(e)}")
    finally:
        print("\n=== 测试完成 ===")

if __name__ == "__main__":
    main() 
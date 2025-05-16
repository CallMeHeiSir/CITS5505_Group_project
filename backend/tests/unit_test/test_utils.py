import re

def extract_csrf_token(html):
    match = re.search(r'name="csrf_token"[^>]*value="([^"]+)"', html)
    return match.group(1) if match else ''

def login_test_user(client, username, email, password):
    # 获取登录页CSRF
    login_page = client.get('/auth/login')
    csrf_token = extract_csrf_token(login_page.data.decode())
    # 登录
    return client.post('/auth/login', data={
        'username': username,
        'email': email,
        'password': password,
        'verificationCode': 'bypass',
        'csrf_token': csrf_token
    }, follow_redirects=True) 
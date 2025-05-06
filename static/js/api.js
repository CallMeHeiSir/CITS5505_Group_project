const API_BASE_URL = '/api';

export async function registerUser(formData) {
    const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    });
    return await response.json();
}

export async function loginUser(credentials) {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    });
    return await response.json();
}

export async function uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await fetch(`${API_BASE_URL}/upload-avatar`, {
        method: 'POST',
        body: formData
    });
    return await response.json();
}

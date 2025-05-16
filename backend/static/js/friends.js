// friends.js

// Friend management functions
let currentTab = 'friends';

function switchTab(tab) {
    // Switch between Friends, Pending Requests, and Search tabs
    currentTab = tab;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    document.querySelector(`#${tab}Content`).classList.add('active');
}

function loadFriends() {
    // Load the user's friends list from the server
    fetch('/api/friend/friends')
        .then(response => response.json())
        .then(data => {
            const friendsList = document.getElementById('friendsList');
            friendsList.innerHTML = '';
            if (data.friends.length === 0) {
                friendsList.innerHTML = '<div class="friend-item text-muted">No friends yet</div>';
                return;
            }
            data.friends.forEach(friend => {
                const avatar = friend.avatar || 'default.png';
                friendsList.innerHTML += `
                    <div class="friend-item">
                        <img src="/static/avatars/${avatar}" alt="${friend.username}" class="friend-avatar">
                        <div class="friend-info">
                            <h6 class="friend-name">${friend.username}</h6>
                            <p class="friend-email">${friend.email}</p>
                        </div>
                    </div>
                `;
            });
        })
        .catch(error => console.error('Error loading friends:', error));
}

function loadPendingRequests() {
    // Load pending friend requests from the server
    fetch('/api/friend/pending_requests')
        .then(response => response.json())
        .then(data => {
            const requestsList = document.getElementById('requestsList');
            requestsList.innerHTML = '';
            if (data.pending_requests.length === 0) {
                requestsList.innerHTML = '<div class="friend-item text-muted">No pending requests</div>';
                return;
            }
            data.pending_requests.forEach(request => {
                const avatar = request.from_user.avatar || 'default.png';
                requestsList.innerHTML += `
                    <div class="friend-request">
                        <div class="friend-item">
                            <img src="/static/avatars/${avatar}" alt="${request.from_user.username}" class="friend-avatar">
                            <div class="friend-info">
                                <h6 class="friend-name">${request.from_user.username}</h6>
                                <p class="friend-email">${request.from_user.email}</p>
                            </div>
                            <div class="friend-actions">
                                <button class="btn-friend btn-accept" onclick="handleRequest(${request.id}, 'accept')">Accept</button>
                                <button class="btn-friend btn-reject" onclick="handleRequest(${request.id}, 'reject')">Reject</button>
                            </div>
                        </div>
                    </div>
                `;
            });
            updateRequestCount(data.pending_requests.length);
        })
        .catch(error => console.error('Error loading requests:', error));
}

function updateRequestCount(count) {
    // Update the badge showing the number of pending requests
    const badge = document.getElementById('requestCount');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
}

function handleRequest(requestId, action) {
    // Handle accepting or rejecting a friend request
    fetch(`/api/friend/handle_request/${requestId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: action })
    })
    .then(response => response.json())
    .then(data => {
    alert(data.message);
    loadPendingRequests();
    fetch('/api/friend/pending_request_count')
        .then(resp => resp.json())
        .then(data => updateRequestCount(data.count));
    if (action === 'accept') {
        loadFriends();
    }
})

    .catch(error => console.error('Error handling request:', error));
}

function searchUsers(query) {
    // Search for users by query and display results
    if (!query.trim()) {
        document.getElementById('searchResults').innerHTML = '';
        return;
    }

    fetch(`/api/friend/search_users?query=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            const searchResults = document.getElementById('searchResults');
            searchResults.innerHTML = '';
            if (data.users.length === 0) {
                searchResults.innerHTML = '<div class="friend-item text-muted">No users found</div>';
                return;
            }
            data.users.forEach(user => {
                const avatar = user.avatar || 'default.png';
                let actionButton = '';
                switch (user.status) {
                    case 'available':
                        actionButton = `<button class="btn-friend btn-send" onclick="sendFriendRequest(${user.id})">Add Friend</button>`;
                        break;
                    case 'pending':
                        actionButton = `<span class="status-badge status-pending">Request Sent</span>`;
                        break;
                    case 'friend':
                        actionButton = `<span class="status-badge status-friends">Friends</span>`;
                        break;
                }
                searchResults.innerHTML += `
                    <div class="friend-item">
                        <img src="/static/avatars/${avatar}" alt="${user.username}" class="friend-avatar">
                        <div class="friend-info">
                            <h6 class="friend-name">${user.username}</h6>
                            <p class="friend-email">${user.email}</p>
                        </div>
                        <div class="friend-actions">
                            ${actionButton}
                        </div>
                    </div>
                `;
            });
        })
        .catch(error => console.error('Error searching users:', error));
}

function sendFriendRequest(userId) {
    // Send a friend request to the specified user
    fetch('/api/friend/send_request', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to_user_id: userId })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        const searchInput = document.getElementById('searchInput');
        if (searchInput.value) {
            searchUsers(searchInput.value);
        }
    })
    .catch(error => console.error('Error sending request:', error));
}

// Add search input event listener with debounce
let searchTimeout = null;
document.addEventListener('DOMContentLoaded', function() {
    // Set up search input, load initial data, and auto-refresh
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchUsers(e.target.value);
            }, 300);
        });
    }

    // Load initial data
    loadFriends();
    loadPendingRequests();
    
    // Set up auto-refresh for request count
    setInterval(loadPendingRequests, 30000);
});

// new_friend.js

// API endpoints
const API = {
    SEARCH: '/api/friends/search',
    REQUEST: '/api/friends/request'
};

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    let searchTimeout;

    // Handle search input with debounce
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        const query = this.value.trim();
        
        if (query.length < 2) {
            searchResults.innerHTML = '<div class="no-results">Enter at least 2 characters to search...</div>';
            return;
        }

        searchTimeout = setTimeout(async () => {
            try {
                const response = await fetch(`${API.SEARCH}?query=${encodeURIComponent(query)}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to search users');
                }

                if (!data.users || data.users.length === 0) {
                    searchResults.innerHTML = '<div class="no-results">No users found</div>';
                    return;
                }

                // Render search results
                searchResults.innerHTML = '';
                data.users.forEach(user => {
                    const div = document.createElement('div');
                    div.className = 'user-item';
                    
                    let actionButton = '';
                    if (user.is_friend) {
                        actionButton = '<button class="btn-text" disabled>Already Friends</button>';
                    } else if (user.has_pending) {
                        actionButton = '<button class="btn-text" disabled>Request Pending</button>';
                    } else {
                        actionButton = `
                            <button class="btn-gradient add-friend" data-id="${user.id}">
                                <i class="bi bi-person-plus"></i> Add Friend
                            </button>
                        `;
                    }
                    
                    div.innerHTML = `
                        <div class="user-info">
                            <div class="username">${user.username}</div>
                            <div class="email">${user.email}</div>
                        </div>
                        <div class="user-actions">
                            ${actionButton}
                        </div>
                    `;
                    searchResults.appendChild(div);
                });

                // Add event listeners to add friend buttons
                document.querySelectorAll('.add-friend').forEach(button => {
                    button.addEventListener('click', async function() {
                        const userId = this.dataset.id;
                        try {
                            const response = await fetch(API.REQUEST, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    friendId: userId
                                })
                            });

                            const data = await response.json();

                            if (!response.ok) {
                                throw new Error(data.error || 'Failed to send friend request');
                            }

                            // Update button state
                            this.disabled = true;
                            this.innerHTML = '<i class="bi bi-check"></i> Request Sent';
                            this.classList.remove('btn-gradient');
                            this.classList.add('btn-text');

                            // Show success message
                            showNotification('Friend request sent successfully!', 'success');
                        } catch (error) {
                            console.error('Error sending friend request:', error);
                            showNotification('Failed to send friend request. Please try again later.', 'error');
                        }
                    });
                });
            } catch (error) {
                console.error('Error searching users:', error);
                searchResults.innerHTML = '<div class="no-results">Failed to search users. Please try again later.</div>';
            }
        }, 300); // Debounce delay
    });
});

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

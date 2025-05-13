// API endpoints
const API = {
    CHARTS: '/api/shares/available-charts',
    FRIENDS: '/api/shares/friends',
    SHARES: '/api/shares',
    RECEIVED: '/api/shares/received',
    SENT: '/api/shares/sent',
    ANALYTICS: '/analytics/api/activities/summary',
    PREDICTIONS: '/analytics/api/analytics/predictions'
};

// Constants and Data Management
const currentUser = "You";
const sharesKey = "privateShares";

// Chart types mapping
const CHART_TYPES = {
    'total-stats': 'Total Statistics',
    'activity-calendar': 'Activity Calendar',
    'calories-prediction': 'Calories Prediction',
    'activity-duration': 'Activity Duration by Day',
    'distance-progress': 'Distance Progress',
    'activity-distribution': 'Activity Distribution',
    'calories-trend': 'Calories Trend',
    'dashboard': 'Complete Dashboard'
};

// Available charts (sample data - should be replaced with actual data from backend)
const availableCharts = [
    { id: "sleep_01", title: "Sleep Tracker" },
    { id: "nutrition_01", title: "Nutrition Breakdown" },
    { id: "workout_01", title: "Workout Summary" }
];

// Sample friends data (should be replaced with actual data from backend)
const friends = [
    { id: "friend1", name: "Bob" },
    { id: "friend2", name: "Alice" },
    { id: "friend3", name: "Charlie" }
];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeSelects();
    loadAndRenderShares();
    setupEventListeners();
});

// Initialize select dropdowns
async function initializeSelects() {
    try {
        const [chartsResponse, friendsResponse] = await Promise.all([
            fetch(API.CHARTS),
            fetch(API.FRIENDS)
        ]);

        if (!chartsResponse.ok || !friendsResponse.ok) {
            throw new Error('Failed to fetch data');
        }

        const chartsData = await chartsResponse.json();
        const friendsData = await friendsResponse.json();

        const chartSelect = document.getElementById('chartSelect');
        const friendSelect = document.getElementById('friendSelect');

        // Populate chart select
        if (chartsData.success && chartsData.charts) {
            chartSelect.innerHTML = '<option value="">Choose a chart...</option>';
            chartsData.charts.forEach(chart => {
                const option = document.createElement('option');
                option.value = chart.id;
                option.textContent = chart.title;
                chartSelect.appendChild(option);
            });
        }

        // Populate friend select
        if (friendsData.success && friendsData.friends) {
            friendSelect.innerHTML = '<option value="">Choose a friend...</option>';
            friendsData.friends.forEach(friend => {
                const option = document.createElement('option');
                option.value = friend.id;
                option.textContent = friend.name;
                friendSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error initializing selects:', error);
        showNotification('Failed to load data. Please try again later.', 'error');
    }
}

// Load and render all shares
async function loadAndRenderShares() {
    try {
        const [receivedResponse, sentResponse] = await Promise.all([
            fetch(API.RECEIVED),
            fetch(API.SENT)
        ]);

        if (!receivedResponse.ok || !sentResponse.ok) {
            throw new Error('Failed to fetch shares');
        }

        const receivedData = await receivedResponse.json();
        const sentData = await sentResponse.json();

        renderReceivedShares(receivedData.success ? receivedData.shares : []);
        renderSentShares(sentData.success ? sentData.shares : []);
    } catch (error) {
        console.error('Error loading shares:', error);
        showNotification('Failed to load shares. Please try again later.', 'error');
    }
}

// Render received shares
function renderReceivedShares(shares) {
    const container = document.getElementById('receivedShares');
    
    if (!shares || shares.length === 0) {
        container.innerHTML = '<div class="no-shares">No shares received yet.</div>';
        return;
    }

    container.innerHTML = shares.map(share => `
        <div class="share-item">
            <div class="share-item-header">
                <div class="share-title">${escapeHtml(share.chartTitle)}</div>
                <div class="share-meta">Shared by ${escapeHtml(share.fromUser)} • ${formatDate(share.time)}</div>
            </div>
            <div class="share-actions">
                <button class="action-button view-chart" data-chart-id="${escapeHtml(share.chartId)}" data-chart-type="${escapeHtml(share.chartType)}">
                    <i class="bi bi-eye"></i>
                    View Chart
                </button>
            </div>
        </div>
    `).join('');
}

// Render sent shares
function renderSentShares(shares) {
    const container = document.getElementById('sentShares');
    
    if (!shares || shares.length === 0) {
        container.innerHTML = '<div class="no-shares">You haven\'t shared anything yet.</div>';
        return;
    }

    container.innerHTML = shares.map(share => `
        <div class="share-item">
            <div class="share-item-header">
                <div class="share-title">${escapeHtml(share.chartTitle)}</div>
                <div class="share-meta">Shared with ${escapeHtml(share.toUser)} • ${formatDate(share.time)}</div>
            </div>
            <div class="share-actions">
                <button class="action-button view-chart" data-chart-id="${escapeHtml(share.chartId)}" data-chart-type="${escapeHtml(share.chartType)}">
                    <i class="bi bi-eye"></i>
                    View Chart
                </button>
                <button class="action-button withdraw" data-share-id="${escapeHtml(share.id)}">
                    <i class="bi bi-x"></i>
                    Withdraw
                </button>
            </div>
        </div>
    `).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Form submission
    const shareForm = document.getElementById('shareForm');
    if (shareForm) {
        shareForm.addEventListener('submit', handleShareSubmit);
    }

    // Section toggles
    const receivedToggle = document.getElementById('receivedToggle');
    const sentToggle = document.getElementById('sentToggle');

    if (receivedToggle) {
        receivedToggle.addEventListener('click', function() {
            const content = document.getElementById('receivedShares');
            const icon = this.querySelector('.bi-chevron-down');
            toggleSection(content, icon);
        });
    }

    if (sentToggle) {
        sentToggle.addEventListener('click', function() {
            const content = document.getElementById('sentShares');
            const icon = this.querySelector('.bi-chevron-down');
            toggleSection(content, icon);
        });
    }

    // Delegate click events for dynamic buttons
    document.addEventListener('click', function(e) {
        const withdrawBtn = e.target.closest('.action-button.withdraw');
        const viewChartBtn = e.target.closest('.action-button.view-chart');

        if (withdrawBtn) {
            handleWithdraw(withdrawBtn);
        } else if (viewChartBtn) {
            handleViewChart(viewChartBtn);
        }
    });
}

// Toggle section visibility
function toggleSection(content, icon) {
    if (content) {
        content.style.display = content.style.display === 'none' ? 'block' : 'none';
        icon.classList.toggle('rotated');
    }
}

// Handle share form submission
async function handleShareSubmit(e) {
    e.preventDefault();
    
    const chartSelect = document.getElementById('chartSelect');
    const friendSelect = document.getElementById('friendSelect');

    const chartType = chartSelect.value;
    const recipientId = friendSelect.value;

    if (!chartType || !recipientId) {
        showNotification('Please select both a chart and a friend to share with.', 'error');
        return;
    }

    try {
        // Fetch the data for the selected chart
        let data;
        if (chartType === 'calories-prediction') {
            const response = await fetch(API.PREDICTIONS);
            data = await response.json();
        } else {
            const response = await fetch(API.ANALYTICS);
            data = await response.json();
        }

        if (!data.success) {
            throw new Error('Failed to fetch chart data');
        }

        // Create share request
        const shareResponse = await fetch(API.SHARES, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chartType,
                friendId: recipientId,
                data: data.data
            })
        });

        if (!shareResponse.ok) {
            throw new Error('Failed to share chart');
        }

        showNotification('Chart shared successfully!', 'success');
        loadAndRenderShares(); // Refresh the shares list
    } catch (error) {
        console.error('Error sharing chart:', error);
        showNotification('Failed to share chart. Please try again later.', 'error');
    }
}

// Handle withdraw action
async function handleWithdraw(button) {
    const shareId = button.dataset.shareId;
    
    if (!confirm('Are you sure you want to withdraw this share?')) {
        return;
    }

    try {
        const response = await fetch(`${API.SHARES}/${shareId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to withdraw share');
        }

        showNotification('Share withdrawn successfully.', 'success');
        await loadAndRenderShares();
    } catch (error) {
        console.error('Error withdrawing share:', error);
        showNotification('Failed to withdraw share. Please try again later.', 'error');
    }
}

// Handle viewing a chart
async function handleViewChart(button) {
    const chartId = button.dataset.chartId;
    const chartType = button.dataset.chartType;
    
    try {
        // Fetch data based on chart type
        let data;
        if (chartType === 'calories-prediction') {
            const response = await fetch(API.PREDICTIONS);
            data = await response.json();
        } else {
            const response = await fetch(API.ANALYTICS);
            data = await response.json();
        }

        if (!data.success) {
            throw new Error('Failed to fetch chart data');
        }

        showChartModal(chartId, chartType, data.data);
    } catch (error) {
        console.error('Error viewing chart:', error);
        showNotification('Failed to load chart. Please try again later.', 'error');
    }
}

// Show chart modal
function showChartModal(chartId, chartType, data) {
    const modal = document.createElement('div');
    modal.className = 'chart-modal';
    modal.innerHTML = `
        <div class="chart-modal-content">
            <div class="chart-modal-header">
                <h3>${CHART_TYPES[chartType] || 'Chart View'}</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="chart-modal-body">
                <canvas id="chartCanvas"></canvas>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.remove();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    const ctx = document.getElementById('chartCanvas').getContext('2d');
    createChart(ctx, chartType, data);
}

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

// Helper function to get chart title
function getChartTitle(chartId) {
    const titles = {
        'weekly_activity': 'Weekly Activity Summary',
        'monthly_progress': 'Monthly Progress',
        'activity_distribution': 'Activity Distribution',
        'calories_trend': 'Calories Trend',
        'activity_stats': 'Activity Statistics'
    };
    return titles[chartId] || 'Chart';
}

// Helper function to format date
function formatDate(isoString) {
    return new Date(isoString).toLocaleString();
}

// Helper function to escape HTML
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Helper function to create appropriate chart
function createChart(ctx, chartType, data) {
    let chartConfig;
    
    switch (chartType) {
        case 'total-stats':
            chartConfig = createTotalStatsChart(data);
            break;
        case 'activity-calendar':
            chartConfig = createActivityCalendarChart(data);
            break;
        case 'calories-prediction':
            chartConfig = createCaloriesPredictionChart(data);
            break;
        case 'activity-duration':
            chartConfig = createActivityDurationChart(data);
            break;
        case 'distance-progress':
            chartConfig = createDistanceProgressChart(data);
            break;
        case 'activity-distribution':
            chartConfig = createActivityDistributionChart(data);
            break;
        case 'calories-trend':
            chartConfig = createCaloriesTrendChart(data);
            break;
        case 'dashboard':
            return createDashboard(ctx, data);
        default:
            throw new Error('Unknown chart type');
    }

    return new Chart(ctx, chartConfig);
}

// Create specific chart configurations
function createTotalStatsChart(data) {
    return {
        type: 'bar',
        data: {
            labels: ['Calories', 'Distance (km)', 'Duration (mins)', 'Activities'],
            datasets: [{
                label: 'Total Stats',
                data: [
                    data.totalCalories,
                    data.totalDistance,
                    data.totalDuration,
                    data.totalActivities
                ],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 206, 86, 0.5)',
                    'rgba(75, 192, 192, 0.5)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    };
}

// Create activity calendar chart
function createActivityCalendarChart(data) {
    // Implementation for activity calendar visualization
    // This would be a heatmap-style calendar view
}

// Create calories prediction chart
function createCaloriesPredictionChart(data) {
    // Implementation for calories prediction visualization
}

// Create activity duration chart
function createActivityDurationChart(data) {
    // Implementation for activity duration by day
}

// Create distance progress chart
function createDistanceProgressChart(data) {
    // Implementation for distance progress
}

// Create activity distribution chart
function createActivityDistributionChart(data) {
    // Implementation for activity distribution
}

// Create calories trend chart
function createCaloriesTrendChart(data) {
    // Implementation for calories trend
}

// Create complete dashboard
function createDashboard(container, data) {
    // Implementation for complete dashboard view
} 
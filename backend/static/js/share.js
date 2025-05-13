// API endpoints
const API = {
    CHARTS: '/api/shares/available-charts',
    FRIENDS: '/api/shares/friends',
    SHARES: '/api/shares',
    RECEIVED: '/api/shares/received',
    SENT: '/api/shares/sent'
};

// Constants and Data Management
const currentUser = "You";
const sharesKey = "privateShares";

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

        const chartsData = await chartsResponse.json();
        const friendsData = await friendsResponse.json();

        if (!chartsResponse.ok) throw new Error(chartsData.error || 'Failed to load charts');
        if (!friendsResponse.ok) throw new Error(friendsData.error || 'Failed to load friends');

        const chartSelect = document.querySelector('.form-select:first-of-type');
        const friendSelect = document.querySelector('.form-select:last-of-type');

        // Populate chart select
        chartSelect.innerHTML = '<option value="">Select a chart to share</option>';
        chartsData.charts.forEach(chart => {
            const option = document.createElement('option');
            option.value = chart.id;
            option.textContent = chart.title;
            chartSelect.appendChild(option);
        });

        // Populate friend select
        friendSelect.innerHTML = '<option value="">Select a friend to share with</option>';
        friendsData.friends.forEach(friend => {
            const option = document.createElement('option');
            option.value = friend.id;
            option.textContent = friend.name;
            friendSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error initializing selects:', error);
        alert('Failed to load charts or friends list. Please try again later.');
    }
}

// Load and render all shares
async function loadAndRenderShares() {
    try {
        const [receivedResponse, sentResponse] = await Promise.all([
            fetch(API.RECEIVED),
            fetch(API.SENT)
        ]);

        const receivedData = await receivedResponse.json();
        const sentData = await sentResponse.json();

        if (!receivedResponse.ok) throw new Error(receivedData.error || 'Failed to load received shares');
        if (!sentResponse.ok) throw new Error(sentData.error || 'Failed to load sent shares');

        renderReceivedShares(receivedData.shares);
        renderSentShares(sentData.shares);
    } catch (error) {
        console.error('Error loading shares:', error);
        alert('Failed to load shares. Please try again later.');
    }
}

// Render received shares
function renderReceivedShares(shares) {
    const container = document.querySelector('.shares-section:nth-of-type(2) .shares-content');

    if (!shares || shares.length === 0) {
        container.innerHTML = '<div class="no-shares">No shares received yet.</div>';
        return;
    }

    container.innerHTML = shares.map(share => `
        <div class="share-item">
            <div class="share-item-header">
                <div class="share-title">${share.chartTitle}</div>
                <div class="share-meta">Shared by ${share.fromUser} • ${formatDate(share.time)}</div>
            </div>
            <div class="share-actions">
                <button class="action-button view-chart" data-chart-id="${share.chartId}">
                    <i class="bi bi-eye"></i>
                    View Chart
                </button>
            </div>
        </div>
    `).join('');
}

// Render sent shares
function renderSentShares(shares) {
    const container = document.querySelector('.shares-section:nth-of-type(3) .shares-content');

    if (!shares || shares.length === 0) {
        container.innerHTML = '<div class="no-shares">You haven\'t shared anything yet.</div>';
        return;
    }

    container.innerHTML = shares.map(share => `
        <div class="share-item">
            <div class="share-item-header">
                <div class="share-title">${share.chartTitle}</div>
                <div class="share-meta">Shared with ${share.toUser} • ${formatDate(share.time)}</div>
            </div>
            <div class="share-actions">
                <button class="action-button view-chart" data-chart-id="${share.chartId}">
                    <i class="bi bi-eye"></i>
                    View Chart
                </button>
                <button class="action-button withdraw" data-share-id="${share.id}">
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
    document.getElementById('shareForm').addEventListener('submit', handleShareSubmit);

    // Section toggles
    document.getElementById('receivedToggle').addEventListener('click', function() {
        this.closest('.shares-section').classList.toggle('collapsed');
        this.querySelector('.bi-chevron-down').classList.toggle('rotated');
    });

    document.getElementById('sentToggle').addEventListener('click', function() {
        this.closest('.shares-section').classList.toggle('collapsed');
        this.querySelector('.bi-chevron-down').classList.toggle('rotated');
    });

    // Delegate click events for dynamic buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.action-button.withdraw')) {
            handleWithdraw(e.target.closest('.action-button.withdraw'));
        }
        if (e.target.closest('.action-button.view-chart')) {
            handleViewChart(e.target.closest('.action-button.view-chart'));
        }
    });
}

// Handle share form submission
async function handleShareSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const chartSelect = form.querySelector('.form-select:first-of-type');
    const friendSelect = form.querySelector('.form-select:last-of-type');

    const chartId = chartSelect.value;
    const recipientId = friendSelect.value;
    const chartTitle = chartSelect.options[chartSelect.selectedIndex].text;

    if (!chartId || !recipientId) {
        alert('Please select both a chart and a friend to share with.');
        return;
    }

    try {
        const response = await fetch(API.SHARES, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chartId,
                chartTitle,
                recipientId
            })
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error || 'Failed to create share');

        alert('Share created successfully!');
        form.reset();
        await loadAndRenderShares();
    } catch (error) {
        console.error('Error creating share:', error);
        alert('Failed to create share. Please try again later.');
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

        if (!response.ok) throw new Error(data.error || 'Failed to withdraw share');

        alert('Share withdrawn successfully.');
        await loadAndRenderShares();
    } catch (error) {
        console.error('Error withdrawing share:', error);
        alert('Failed to withdraw share. Please try again later.');
    }
}

// Handle viewing a chart
async function handleViewChart(button) {
    const chartId = button.dataset.chartId;
    
    try {
        // Get the visualization data from the API
        const response = await fetch('/api/visualization/activities', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                // Send empty filters to get all data
                startDate: null,
                endDate: null,
                activityType: null
            })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch chart data');
        }

        const data = await response.json();
        
        // Create modal for displaying the chart
        const modal = document.createElement('div');
        modal.className = 'chart-modal';
        modal.innerHTML = `
            <div class="chart-modal-content">
                <div class="chart-modal-header">
                    <h3>${getChartTitle(chartId)}</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="chart-modal-body">
                    <canvas id="chartCanvas"></canvas>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listener to close button
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });
        
        // Create the chart based on chart type
        const ctx = document.getElementById('chartCanvas').getContext('2d');
        createChart(ctx, chartId, data);
        
    } catch (error) {
        console.error('Error viewing chart:', error);
        alert('Failed to load chart data. Please try again later.');
    }
}

// Helper function to get chart title
function getChartTitle(chartId) {
    switch (chartId) {
        case 'weekly_activity':
            return 'Weekly Activity Summary';
        case 'monthly_progress':
            return 'Monthly Progress';
        case 'activity_distribution':
            return 'Activity Distribution';
        case 'calories_trend':
            return 'Calories Trend';
        case 'activity_stats':
            return 'Activity Statistics';
        default:
            return 'Chart';
    }
}

// Helper function to create appropriate chart
function createChart(ctx, chartId, data) {
    switch (chartId) {
        case 'weekly_activity':
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.weekly_data.labels,
                    datasets: [
                        {
                            label: 'Duration (minutes)',
                            data: data.weekly_data.duration,
                            backgroundColor: 'rgba(54, 162, 235, 0.5)'
                        },
                        {
                            label: 'Distance (km)',
                            data: data.weekly_data.distance,
                            backgroundColor: 'rgba(75, 192, 192, 0.5)'
                        },
                        {
                            label: 'Calories',
                            data: data.weekly_data.calories,
                            backgroundColor: 'rgba(255, 99, 132, 0.5)'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
            break;
            
        case 'monthly_progress':
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.progress_data.labels,
                    datasets: [
                        {
                            label: 'Distance (km)',
                            data: data.progress_data.distance,
                            borderColor: 'rgb(75, 192, 192)',
                            tension: 0.1
                        },
                        {
                            label: 'Duration (minutes)',
                            data: data.progress_data.duration,
                            borderColor: 'rgb(54, 162, 235)',
                            tension: 0.1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
            break;
            
        case 'activity_distribution':
            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: data.activity_distribution.labels,
                    datasets: [{
                        data: data.activity_distribution.data,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.5)',
                            'rgba(54, 162, 235, 0.5)',
                            'rgba(255, 206, 86, 0.5)',
                            'rgba(75, 192, 192, 0.5)',
                            'rgba(153, 102, 255, 0.5)'
                        ]
                    }]
                },
                options: {
                    responsive: true
                }
            });
            break;
            
        case 'calories_trend':
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.calories_trend.labels,
                    datasets: [{
                        label: 'Calories Burned',
                        data: data.calories_trend.data,
                        borderColor: 'rgb(255, 99, 132)',
                        tension: 0.1
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
            });
            break;
            
        case 'activity_stats':
            // For stats, we'll create a custom display
            ctx.canvas.style.display = 'none';
            const modalBody = ctx.canvas.parentElement;
            modalBody.innerHTML = `
                <div class="stats-container">
                    <div class="stat-item">
                        <h4>Total Activities</h4>
                        <p>${data.stats.count}</p>
                    </div>
                    <div class="stat-item">
                        <h4>Total Duration</h4>
                        <p>${Math.round(data.stats.total_duration)} minutes</p>
                    </div>
                    <div class="stat-item">
                        <h4>Total Distance</h4>
                        <p>${data.stats.total_distance.toFixed(2)} km</p>
                    </div>
                    <div class="stat-item">
                        <h4>Total Calories</h4>
                        <p>${Math.round(data.stats.total_calories)} kcal</p>
                    </div>
                    <div class="stat-item">
                        <h4>Average Duration</h4>
                        <p>${Math.round(data.stats.avg_duration)} minutes</p>
                    </div>
                    <div class="stat-item">
                        <h4>Average Distance</h4>
                        <p>${data.stats.avg_distance.toFixed(2)} km</p>
                    </div>
                </div>
            `;
            break;
    }
}

// Helper function to format date
function formatDate(isoString) {
    return new Date(isoString).toLocaleString();
} 
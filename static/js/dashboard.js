document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips and popovers
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
    
    // Initialize the course activity chart
    const activityChart = document.getElementById('courseActivityChart');
    if (activityChart) {
        new Chart(activityChart, {
            type: 'line',
            data: {
                labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                datasets: [{
                    label: 'Student Logins',
                    data: [65, 59, 80, 81, 56, 40, 30],
                    borderColor: 'rgba(13, 110, 253, 1)',
                    tension: 0.1,
                    fill: false
                }, {
                    label: 'Assignment Submissions',
                    data: [28, 48, 40, 19, 86, 27, 15],
                    borderColor: 'rgba(25, 135, 84, 1)',
                    tension: 0.1,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Weekly Course Activity'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false,
                }
            }
        });
    }

    // Initialize the upcoming deadlines progress
    const assignmentProgress = document.querySelectorAll('.assignment-progress');
    assignmentProgress.forEach(progress => {
        const value = progress.getAttribute('data-value');
        progress.style.width = value + '%';
    });

    // Get notifications (this would be an API call in a production app)
    function getNotifications() {
        return [
            { id: 1, title: 'New Assignment Submission', message: 'John Doe has submitted Assignment #3', time: '5 minutes ago', read: false },
            { id: 2, title: 'Grading Reminder', message: 'You have 15 ungraded assignments', time: '1 hour ago', read: false },
            { id: 3, title: 'Course Update', message: 'Data Structures syllabus has been updated', time: '2 hours ago', read: true }
        ];
    }

    // Display notifications
    function displayNotifications() {
        const notifications = getNotifications();
        const notificationContainer = document.getElementById('notificationList');
        const notificationCount = document.getElementById('notificationCount');
        
        if (notificationContainer) {
            notificationContainer.innerHTML = '';
            let unreadCount = 0;
            
            notifications.forEach(notification => {
                if (!notification.read) unreadCount++;
                
                const notificationItem = document.createElement('a');
                notificationItem.href = '#';
                notificationItem.className = notification.read ? 'dropdown-item d-flex align-items-center py-2' : 'dropdown-item d-flex align-items-center py-2 bg-light';
                
                notificationItem.innerHTML = `
                    <div class="mr-3">
                        <div class="icon-circle ${notification.read ? 'bg-secondary' : 'bg-primary'}">
                            <i class="fas fa-bell text-white"></i>
                        </div>
                    </div>
                    <div>
                        <div class="small text-gray-500">${notification.time}</div>
                        <span class="${notification.read ? '' : 'fw-bold'}">${notification.title}</span>
                        <div class="small">${notification.message}</div>
                    </div>
                `;
                
                notificationContainer.appendChild(notificationItem);
            });
            
            if (notificationCount) {
                notificationCount.textContent = unreadCount;
                if (unreadCount > 0) {
                    notificationCount.classList.remove('d-none');
                } else {
                    notificationCount.classList.add('d-none');
                }
            }
        }
    }

    // Call to display notifications when page loads
    displayNotifications();
});

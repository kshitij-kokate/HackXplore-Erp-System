/**
 * Main JavaScript for AI-Powered College ERP System
 * Contains global functionality used across multiple pages
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialize Bootstrap popovers
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
    
    // Setup theme switcher if the toggle exists
    setupThemeSwitcher();
    
    // Setup notification system
    setupNotifications();
    
    // Handle sidebar toggle for mobile
    setupSidebarToggle();
});

/**
 * Setup theme switcher functionality
 */
function setupThemeSwitcher() {
    const themeSwitch = document.getElementById('themeSwitch');
    if (themeSwitch) {
        // Check user preference
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme) {
            document.documentElement.setAttribute('data-bs-theme', currentTheme);
            themeSwitch.checked = currentTheme === 'dark';
        }
        
        // Handle theme switch
        themeSwitch.addEventListener('change', function() {
            if (this.checked) {
                document.documentElement.setAttribute('data-bs-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.setAttribute('data-bs-theme', 'light');
                localStorage.setItem('theme', 'light');
            }
        });
    }
}

/**
 * Setup notification functionality
 */
function setupNotifications() {
    // This will be implemented when notification system is ready
    const notificationBell = document.querySelector('.notification-bell');
    if (notificationBell) {
        notificationBell.addEventListener('click', function(e) {
            e.preventDefault();
            // Toggle notification dropdown or panel
            console.log('Notification bell clicked');
        });
    }
}

/**
 * Setup sidebar toggle for mobile views
 */
function setupSidebarToggle() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            document.body.classList.toggle('sidebar-collapsed');
        });
    }
}

/**
 * Show an alert message
 * @param {string} message - The message to display
 * @param {string} type - The type of alert (success, danger, warning, info)
 * @param {string} containerId - The ID of the container to add the alert to
 */
function showAlert(message, type = 'info', containerId = 'alertContainer') {
    const alertContainer = document.getElementById(containerId);
    if (!alertContainer) return;
    
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type} alert-dismissible fade show`;
    alertElement.role = 'alert';
    alertElement.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    alertContainer.appendChild(alertElement);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        alertElement.classList.remove('show');
        setTimeout(() => {
            alertContainer.removeChild(alertElement);
        }, 150);
    }, 5000);
}

/**
 * Format date string to a more readable format
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

/**
 * Format time string to a more readable format
 * @param {string} timeString - The time string to format
 * @returns {string} Formatted time string
 */
function formatTime(timeString) {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString(undefined, options);
}

/**
 * Get status badge HTML
 * @param {string} status - The status
 * @returns {string} HTML for the status badge
 */
function getStatusBadge(status) {
    let badgeClass = 'secondary';
    
    switch (status.toLowerCase()) {
        case 'completed':
        case 'done':
        case 'active':
        case 'approved':
            badgeClass = 'success';
            break;
        case 'pending':
        case 'in progress':
        case 'in-progress':
            badgeClass = 'warning';
            break;
        case 'failed':
        case 'rejected':
        case 'inactive':
            badgeClass = 'danger';
            break;
        case 'new':
            badgeClass = 'info';
            break;
    }
    
    return `<span class="badge bg-${badgeClass}">${status}</span>`;
}
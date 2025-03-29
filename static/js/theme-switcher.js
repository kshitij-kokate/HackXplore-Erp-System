/**
 * Theme Switcher for AI-Powered College ERP System
 * Handles switching between dark and light theme modes
 */

// Make functions globally accessible
window.toggleTheme = function() {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    if (currentTheme === 'dark') {
        setLightMode();
    } else {
        setDarkMode();
    }
};

// Function to switch to dark mode
function setDarkMode() {
    document.documentElement.setAttribute('data-bs-theme', 'dark');
    localStorage.setItem('theme', 'dark');
    updateToggleStatus();
}

// Function to switch to light mode
function setLightMode() {
    document.documentElement.setAttribute('data-bs-theme', 'light');
    localStorage.setItem('theme', 'light');
    updateToggleStatus();
}

// Update toggle button icon based on current theme
function updateToggleStatus() {
    const themeToggleIcon = document.getElementById('themeToggleIcon');
    if (themeToggleIcon) {
        const currentTheme = localStorage.getItem('theme') || 'dark';
        if (currentTheme === 'dark') {
            themeToggleIcon.classList.remove('fa-moon');
            themeToggleIcon.classList.add('fa-sun');
        } else {
            themeToggleIcon.classList.remove('fa-sun');
            themeToggleIcon.classList.add('fa-moon');
        }
    }
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check for saved theme preference or use device preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Set initial theme based on saved preference or device preference
    if (savedTheme === 'light') {
        setLightMode();
    } else if (savedTheme === 'dark' || prefersDark) {
        setDarkMode();
    } else {
        setDarkMode(); // Default to dark mode if no preference
    }
    
    // Update toggle button status
    updateToggleStatus();
});
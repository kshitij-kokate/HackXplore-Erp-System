/**
 * GitHub Integration JavaScript for AI-Powered College ERP System
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    loadConnectedRepositories();
    loadCourses();
    setupEventListeners();
});

/**
 * Load connected GitHub repositories
 */
function loadConnectedRepositories() {
    // This would typically fetch from the backend
    console.log('Loading connected repositories...');
    
    // Sample repositories are already in the HTML for this demo
}

/**
 * Display a repository in the connected repositories table
 */
function showConnectedRepo(repoUrl, repoName, lastSync) {
    const tbody = document.querySelector('.card-body table tbody');
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${repoName}</td>
        <td><a href="${repoUrl}" target="_blank">${repoUrl}</a></td>
        <td>${lastSync}</td>
        <td>
            <button class="btn btn-info btn-sm"><i class="fas fa-sync"></i></button>
            <button class="btn btn-danger btn-sm"><i class="fas fa-trash"></i></button>
        </td>
    `;
    
    tbody.appendChild(tr);
}

/**
 * Load courses for the course dropdown
 */
function loadCourses() {
    // This would typically fetch from the backend
    console.log('Loading courses...');
    
    // Course options are already in the HTML for this demo
}

/**
 * Load assignments for the selected course
 */
function loadAssignments(course) {
    // This would typically fetch from the backend based on the selected course
    console.log('Loading assignments for course: ' + course);
    
    // Sample assignments are already in the HTML for this demo
}

/**
 * Setup event listeners for interactive elements
 */
function setupEventListeners() {
    // Course selection change
    const courseSelect = document.getElementById('courseSelect');
    if (courseSelect) {
        courseSelect.addEventListener('change', function() {
            const courseId = this.value;
            if (courseId) {
                loadAssignments(courseId);
            }
        });
    }
    
    // Link repository button
    const linkRepoButton = document.getElementById('linkRepository');
    if (linkRepoButton) {
        linkRepoButton.addEventListener('click', function() {
            const courseId = document.getElementById('courseSelect').value;
            const assignmentId = document.getElementById('assignmentSelect').value;
            const repoId = document.getElementById('repoSelect').value;
            
            if (!courseId || !assignmentId || !repoId) {
                showAlert('Please select course, assignment and repository', 'danger');
                return;
            }
            
            // This would typically send data to the backend
            console.log('Linking repository...');
            console.log('Course ID: ' + courseId);
            console.log('Assignment ID: ' + assignmentId);
            console.log('Repository ID: ' + repoId);
            
            showAlert('Repository linked successfully to assignment', 'success');
        });
    }
    
    // Activate repository button
    const activateRepoButton = document.getElementById('activateRepo');
    if (activateRepoButton) {
        activateRepoButton.addEventListener('click', function() {
            const repoUrl = document.querySelector('input[placeholder*="Enter GitHub repository URL"]').value;
            
            if (!repoUrl) {
                showAlert('Please enter a GitHub repository URL', 'danger');
                return;
            }
            
            // This would typically send data to the backend
            console.log('Activating repository: ' + repoUrl);
            
            showAlert('Repository activated successfully', 'success');
        });
    }
    
    // Run Analysis button
    const runAnalysisButton = document.querySelector('.card:last-child .btn-primary');
    if (runAnalysisButton) {
        runAnalysisButton.addEventListener('click', function() {
            const repoUrl = document.querySelector('.card:last-child input').value;
            
            if (!repoUrl) {
                showAlert('Please enter a GitHub repository URL for analysis', 'danger');
                return;
            }
            
            // This would typically send data to the backend
            console.log('Running analysis on repository: ' + repoUrl);
            
            showAlert('Analysis started. Results will be available soon.', 'info');
        });
    }
}

/**
 * Show an alert message
 */
function showAlert(message, type) {
    const alertPlaceholder = document.createElement('div');
    alertPlaceholder.className = 'alert-container position-fixed top-0 end-0 p-3';
    alertPlaceholder.style.zIndex = '5000';
    document.body.appendChild(alertPlaceholder);
    
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    alertPlaceholder.appendChild(wrapper);
    
    setTimeout(() => {
        wrapper.querySelector('.alert').classList.remove('show');
        setTimeout(() => alertPlaceholder.remove(), 300);
    }, 3000);
}
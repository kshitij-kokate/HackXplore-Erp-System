// learning.js - Functionality for the learning paths feature

document.addEventListener('DOMContentLoaded', function() {
    // Initialize learning path functionality if on the learning page
    if (document.getElementById('learning-recommendations')) {
        initLearningPathPage();
    }
});

// Initialize the learning path page
function initLearningPathPage() {
    // Load initial recommendations
    loadCourseRecommendations();
    
    // Set up event listeners
    setupLearningPathListeners();
}

// Set up event listeners for the learning path page
function setupLearningPathListeners() {
    // Handle skill gap submission
    const skillGapForm = document.getElementById('skill-gap-form');
    if (skillGapForm) {
        skillGapForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const skillsInput = document.getElementById('desired-skills');
            if (skillsInput) {
                const skillsList = skillsInput.value.split(',')
                    .map(skill => skill.trim())
                    .filter(skill => skill.length > 0);
                
                if (skillsList.length > 0) {
                    showLoading('skill-gap-recommendations');
                    requestSkillGapCourses(skillsList);
                }
            }
        });
    }
    
    // Handle next level course button
    const nextLevelBtn = document.getElementById('next-level-btn');
    if (nextLevelBtn) {
        nextLevelBtn.addEventListener('click', function() {
            showLoading('next-level-courses');
            loadNextLevelCourses();
        });
    }
}

// Load course recommendations
function loadCourseRecommendations() {
    showLoading('learning-recommendations');
    
    // In a real app, this would be an API call
    // For this demo, we'll simulate a response
    setTimeout(() => {
        fetch('/api/learning/recommendations')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load recommendations');
                }
                return response.json();
            })
            .then(data => {
                displayCourseRecommendations(data.courses);
            })
            .catch(error => {
                console.error('Error:', error);
                showError('learning-recommendations', 'Failed to load course recommendations. Please try again later.');
            });
    }, 600);
}

// Load next level courses
function loadNextLevelCourses() {
    // In a real app, this would be an API call
    // For this demo, we'll simulate a response
    setTimeout(() => {
        fetch('/api/learning/next-level')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load next level courses');
                }
                return response.json();
            })
            .then(data => {
                displayNextLevelCourses(data.courses);
            })
            .catch(error => {
                console.error('Error:', error);
                showError('next-level-courses', 'Failed to load next level courses. Please try again later.');
            });
    }, 600);
}

// Request courses to address skill gaps
function requestSkillGapCourses(skillsList) {
    // In a real app, this would be an API call
    // For this demo, we'll simulate a response
    setTimeout(() => {
        fetch('/api/learning/skill-gaps', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ skills: skillsList }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load skill gap courses');
                }
                return response.json();
            })
            .then(data => {
                displaySkillGapCourses(data.courses);
            })
            .catch(error => {
                console.error('Error:', error);
                showError('skill-gap-recommendations', 'Failed to load skill gap courses. Please try again later.');
            });
    }, 800);
}

// Display course recommendations
function displayCourseRecommendations(courses) {
    const container = document.getElementById('learning-recommendations');
    
    if (!courses || courses.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                No course recommendations available. Complete more courses to get personalized recommendations.
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="row">
    `;
    
    courses.forEach(course => {
        html += createCourseCard(course);
    });
    
    html += `
        </div>
    `;
    
    container.innerHTML = html;
}

// Display next level courses
function displayNextLevelCourses(courses) {
    const container = document.getElementById('next-level-courses');
    
    if (!courses || courses.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                No next level courses available. You might need to complete more prerequisite courses.
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="row">
    `;
    
    courses.forEach(course => {
        html += createCourseCard(course);
    });
    
    html += `
        </div>
    `;
    
    container.innerHTML = html;
}

// Display skill gap courses
function displaySkillGapCourses(courses) {
    const container = document.getElementById('skill-gap-recommendations');
    
    if (!courses || courses.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                No courses found that match the desired skills. Try different skills or check back later.
            </div>
        `;
        return;
    }
    
    let html = `
        <h4 class="mb-3">Recommended Courses for Your Desired Skills</h4>
        <div class="row">
    `;
    
    courses.forEach(course => {
        html += createCourseCard(course);
    });
    
    html += `
        </div>
    `;
    
    container.innerHTML = html;
}

// Create a course card
function createCourseCard(course) {
    const levelClass = getLevelBadgeClass(course.level);
    
    return `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card h-100">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="card-title mb-0">${escapeHtml(course.title)}</h5>
                    <span class="badge ${levelClass}">${escapeHtml(course.level)}</span>
                </div>
                <div class="card-body">
                    <p class="card-text">${escapeHtml(course.description)}</p>
                    
                    <h6 class="mt-3">Topics:</h6>
                    <div class="mb-2">
                        ${createTags(course.topics, 'info')}
                    </div>
                    
                    <h6>Skills Gained:</h6>
                    <div>
                        ${createTags(course.skills_gained, 'success')}
                    </div>
                </div>
                <div class="card-footer">
                    <button class="btn btn-primary btn-sm">Enroll</button>
                    <button class="btn btn-outline-secondary btn-sm">More Info</button>
                </div>
            </div>
        </div>
    `;
}

// Get the appropriate badge class based on course level
function getLevelBadgeClass(level) {
    switch (level.toLowerCase()) {
        case 'beginner':
            return 'bg-success';
        case 'intermediate':
            return 'bg-warning text-dark';
        case 'advanced':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
}

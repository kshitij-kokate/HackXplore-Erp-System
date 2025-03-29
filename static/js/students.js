document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Load students data
    function loadStudents() {
        // In a real application, this would be an API call
        // For now, we'll just simulate it
        const students = [
            { id: 1, name: 'John Doe', email: 'john.doe@university.edu', course: 'Computer Science', year: 3, averageGrade: 85, status: 'Active', riskStatus: 'Low' },
            { id: 2, name: 'Jane Smith', email: 'jane.smith@university.edu', course: 'Computer Science', year: 2, averageGrade: 92, status: 'Active', riskStatus: 'Low' },
            { id: 3, name: 'Michael Johnson', email: 'michael.j@university.edu', course: 'Information Technology', year: 3, averageGrade: 78, status: 'Active', riskStatus: 'Medium' },
            { id: 4, name: 'Emily Davis', email: 'emily.d@university.edu', course: 'Data Science', year: 4, averageGrade: 90, status: 'Active', riskStatus: 'Low' },
            { id: 5, name: 'Robert Wilson', email: 'robert.w@university.edu', course: 'Computer Science', year: 2, averageGrade: 65, status: 'Active', riskStatus: 'High' },
            { id: 6, name: 'Sarah Brown', email: 'sarah.b@university.edu', course: 'Information Technology', year: 3, averageGrade: 88, status: 'Active', riskStatus: 'Low' },
            { id: 7, name: 'David Miller', email: 'david.m@university.edu', course: 'Data Science', year: 1, averageGrade: 72, status: 'Active', riskStatus: 'Medium' },
            { id: 8, name: 'Jennifer White', email: 'jennifer.w@university.edu', course: 'Computer Science', year: 4, averageGrade: 58, status: 'Active', riskStatus: 'High' }
        ];

        const studentsList = document.getElementById('studentsList');
        if (studentsList) {
            studentsList.innerHTML = '';

            if (students.length === 0) {
                studentsList.innerHTML = '<tr><td colspan="8" class="text-center">No students found</td></tr>';
                return;
            }

            students.forEach(student => {
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${student.name}</td>
                    <td>${student.email}</td>
                    <td>${student.course}</td>
                    <td>${student.year}</td>
                    <td>${student.averageGrade}%</td>
                    <td><span class="badge bg-${student.status === 'Active' ? 'success' : 'secondary'}">${student.status}</span></td>
                    <td><span class="badge bg-${getRiskColor(student.riskStatus)}">${student.riskStatus}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary view-btn" data-id="${student.id}" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-success message-btn" data-id="${student.id}" title="Send Message">
                            <i class="fas fa-envelope"></i>
                        </button>
                        <button class="btn btn-sm btn-info analytics-btn" data-id="${student.id}" title="View Analytics">
                            <i class="fas fa-chart-line"></i>
                        </button>
                    </td>
                `;
                
                studentsList.appendChild(row);
            });

            // Add event listeners to the buttons
            document.querySelectorAll('.view-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const studentId = this.getAttribute('data-id');
                    showStudentDetails(studentId);
                });
            });

            document.querySelectorAll('.message-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const studentId = this.getAttribute('data-id');
                    showMessageModal(studentId);
                });
            });

            document.querySelectorAll('.analytics-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const studentId = this.getAttribute('data-id');
                    showStudentAnalytics(studentId);
                });
            });
        }
    }

    // Function to get risk color
    function getRiskColor(riskStatus) {
        switch(riskStatus) {
            case 'Low':
                return 'success';
            case 'Medium':
                return 'warning';
            case 'High':
                return 'danger';
            default:
                return 'secondary';
        }
    }

    // Function to show student details
    function showStudentDetails(studentId) {
        // In a real application, this would fetch the student details from an API
        // For now, we'll use a fixed student
        const student = {
            id: studentId,
            name: 'John Doe',
            email: 'john.doe@university.edu',
            phone: '(555) 123-4567',
            address: '123 University Ave, College Town, CT 12345',
            course: 'Computer Science',
            year: 3,
            enrollmentDate: '2021-09-01',
            advisor: 'Dr. Jane Smith',
            currentCourses: [
                { code: 'CS301', name: 'Data Structures', grade: 'A-' },
                { code: 'CS302', name: 'Database Management', grade: 'B+' },
                { code: 'CS303', name: 'Web Development', grade: 'A' },
                { code: 'MATH201', name: 'Discrete Mathematics', grade: 'B' }
            ],
            attendance: 92,
            averageGrade: 85,
            riskStatus: 'Low'
        };

        const studentDetailsContainer = document.getElementById('studentDetailsContainer');
        const studentDetails = document.getElementById('studentDetails');
        
        if (studentDetailsContainer && studentDetails) {
            // Populate student details
            document.getElementById('detailsStudentName').textContent = student.name;
            
            studentDetails.innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <h5>Personal Information</h5>
                        <p><strong>Email:</strong> ${student.email}</p>
                        <p><strong>Phone:</strong> ${student.phone}</p>
                        <p><strong>Address:</strong> ${student.address}</p>
                    </div>
                    <div class="col-md-6">
                        <h5>Academic Information</h5>
                        <p><strong>Program:</strong> ${student.course}</p>
                        <p><strong>Year:</strong> ${student.year}</p>
                        <p><strong>Enrollment Date:</strong> ${student.enrollmentDate}</p>
                        <p><strong>Academic Advisor:</strong> ${student.advisor}</p>
                    </div>
                </div>
                
                <div class="row mt-4">
                    <div class="col-12">
                        <h5>Current Courses</h5>
                        <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Course Code</th>
                                    <th>Course Name</th>
                                    <th>Current Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${student.currentCourses.map(course => `
                                    <tr>
                                        <td>${course.code}</td>
                                        <td>${course.name}</td>
                                        <td>${course.grade}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="row mt-4">
                    <div class="col-md-6">
                        <h5>Performance Metrics</h5>
                        <p><strong>Attendance Rate:</strong> ${student.attendance}%</p>
                        <p><strong>Average Grade:</strong> ${student.averageGrade}%</p>
                        <p><strong>Risk Status:</strong> <span class="badge bg-${getRiskColor(student.riskStatus)}">${student.riskStatus}</span></p>
                    </div>
                    <div class="col-md-6">
                        <h5>Actions</h5>
                        <button class="btn btn-primary mb-2" id="scheduleAdvisingBtn">
                            <i class="fas fa-calendar-alt me-2"></i> Schedule Advising
                        </button>
                        <button class="btn btn-success mb-2" id="generateReportBtn">
                            <i class="fas fa-file-alt me-2"></i> Generate Report
                        </button>
                        <button class="btn btn-info" id="recommendResourcesBtn">
                            <i class="fas fa-book me-2"></i> Recommend Resources
                        </button>
                    </div>
                </div>
            `;
            
            // Show the details container
            studentDetailsContainer.classList.remove('d-none');
            
            // Scroll to details
            studentDetailsContainer.scrollIntoView({ behavior: 'smooth' });
            
            // Add event listeners for action buttons
            document.getElementById('scheduleAdvisingBtn').addEventListener('click', function() {
                showAlert('Advising session scheduled with Dr. Jane Smith for Monday at 2:00 PM.', 'success');
            });
            
            document.getElementById('generateReportBtn').addEventListener('click', function() {
                showAlert('Performance report generated and sent to your email.', 'success');
            });
            
            document.getElementById('recommendResourcesBtn').addEventListener('click', function() {
                showAIRecommendations(studentId);
            });
        }
    }

    // Function to show message modal
    function showMessageModal(studentId) {
        // In a real application, we would fetch the student name
        let studentName = 'John Doe';
        if (studentId == 2) studentName = 'Jane Smith';
        else if (studentId == 3) studentName = 'Michael Johnson';
        
        const messageModal = new bootstrap.Modal(document.getElementById('messageModal'));
        document.getElementById('messageModalLabel').textContent = `Message to ${studentName}`;
        document.getElementById('messageStudentId').value = studentId;
        
        // Clear previous message
        document.getElementById('messageText').value = '';
        
        messageModal.show();
    }

    // Function to show student analytics
    function showStudentAnalytics(studentId) {
        // In a real application, this would fetch analytics data from an API
        
        const analyticsContainer = document.getElementById('studentAnalyticsContainer');
        if (analyticsContainer) {
            analyticsContainer.classList.remove('d-none');
            
            // Scroll to analytics
            analyticsContainer.scrollIntoView({ behavior: 'smooth' });
            
            // Initialize charts
            initializeGradeChart();
            initializeAttendanceChart();
            initializeEngagementChart();
            initializeTimelineChart();
        }
    }

    // Initialize grade trend chart
    function initializeGradeChart() {
        const gradeCtx = document.getElementById('gradeTrendChart');
        if (gradeCtx) {
            const gradeTrendChart = new Chart(gradeCtx, {
                type: 'line',
                data: {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
                    datasets: [{
                        label: 'Student Grade',
                        data: [75, 78, 80, 82, 79, 85, 88, 85],
                        borderColor: 'rgba(13, 110, 253, 1)',
                        backgroundColor: 'rgba(13, 110, 253, 0.1)',
                        tension: 0.4,
                        fill: true
                    }, {
                        label: 'Class Average',
                        data: [72, 73, 75, 74, 76, 78, 77, 80],
                        borderColor: 'rgba(108, 117, 125, 1)',
                        backgroundColor: 'rgba(108, 117, 125, 0.1)',
                        tension: 0.4,
                        fill: true,
                        borderDash: [5, 5]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Grade Trend Over Time'
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false
                        }
                    },
                    scales: {
                        y: {
                            min: 50,
                            max: 100,
                            title: {
                                display: true,
                                text: 'Grade (%)'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Week'
                            }
                        }
                    }
                }
            });
        }
    }

    // Initialize attendance chart
    function initializeAttendanceChart() {
        const attendanceCtx = document.getElementById('attendanceChart');
        if (attendanceCtx) {
            const attendanceChart = new Chart(attendanceCtx, {
                type: 'bar',
                data: {
                    labels: ['CS301', 'CS302', 'CS303', 'MATH201'],
                    datasets: [{
                        label: 'Attendance Rate (%)',
                        data: [95, 88, 100, 85],
                        backgroundColor: [
                            'rgba(25, 135, 84, 0.7)',
                            'rgba(25, 135, 84, 0.7)',
                            'rgba(25, 135, 84, 0.7)',
                            'rgba(255, 193, 7, 0.7)'
                        ],
                        borderColor: [
                            'rgba(25, 135, 84, 1)',
                            'rgba(25, 135, 84, 1)',
                            'rgba(25, 135, 84, 1)',
                            'rgba(255, 193, 7, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Attendance by Course'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            title: {
                                display: true,
                                text: 'Attendance (%)'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Course'
                            }
                        }
                    }
                }
            });
        }
    }

    // Initialize engagement chart
    function initializeEngagementChart() {
        const engagementCtx = document.getElementById('engagementChart');
        if (engagementCtx) {
            const engagementChart = new Chart(engagementCtx, {
                type: 'radar',
                data: {
                    labels: [
                        'Class Participation',
                        'Assignment Completion',
                        'Discussion Forums',
                        'Project Work',
                        'Resource Usage',
                        'Peer Collaboration'
                    ],
                    datasets: [{
                        label: 'Student Engagement',
                        data: [85, 90, 70, 85, 65, 75],
                        fill: true,
                        backgroundColor: 'rgba(13, 110, 253, 0.2)',
                        borderColor: 'rgba(13, 110, 253, 1)',
                        pointBackgroundColor: 'rgba(13, 110, 253, 1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(13, 110, 253, 1)'
                    }, {
                        label: 'Class Average',
                        data: [75, 80, 65, 70, 60, 65],
                        fill: true,
                        backgroundColor: 'rgba(108, 117, 125, 0.2)',
                        borderColor: 'rgba(108, 117, 125, 1)',
                        pointBackgroundColor: 'rgba(108, 117, 125, 1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(108, 117, 125, 1)',
                        borderDash: [5, 5]
                    }]
                },
                options: {
                    elements: {
                        line: {
                            borderWidth: 3
                        }
                    },
                    scales: {
                        r: {
                            angleLines: {
                                display: true
                            },
                            suggestedMin: 0,
                            suggestedMax: 100
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Engagement Metrics'
                        }
                    }
                }
            });
        }
    }

    // Initialize timeline chart
    function initializeTimelineChart() {
        const timelineCtx = document.getElementById('assignmentTimelineChart');
        if (timelineCtx) {
            const timelineChart = new Chart(timelineCtx, {
                type: 'bar',
                data: {
                    labels: ['Assignment 1', 'Assignment 2', 'Assignment 3', 'Assignment 4', 'Assignment 5'],
                    datasets: [{
                        label: 'Days Before Deadline',
                        data: [2, 1, 0, -1, 3],
                        backgroundColor: [
                            'rgba(25, 135, 84, 0.7)',
                            'rgba(25, 135, 84, 0.7)',
                            'rgba(255, 193, 7, 0.7)',
                            'rgba(220, 53, 69, 0.7)',
                            'rgba(25, 135, 84, 0.7)'
                        ],
                        borderColor: [
                            'rgba(25, 135, 84, 1)',
                            'rgba(25, 135, 84, 1)',
                            'rgba(255, 193, 7, 1)',
                            'rgba(220, 53, 69, 1)',
                            'rgba(25, 135, 84, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Assignment Submission Timeline'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const value = context.raw;
                                    if (value > 0) return `Submitted ${value} days before deadline`;
                                    else if (value === 0) return 'Submitted on deadline day';
                                    else return `Submitted ${Math.abs(value)} days after deadline`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            title: {
                                display: true,
                                text: 'Days (+ early, - late)'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Assignment'
                            }
                        }
                    }
                }
            });
        }
    }

    // Function to show AI recommendations
    function showAIRecommendations(studentId) {
        const aiRecommendationsContainer = document.getElementById('aiRecommendationsContainer');
        if (aiRecommendationsContainer) {
            // Show loading indicator
            aiRecommendationsContainer.innerHTML = '<div class="text-center my-4"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div><p class="mt-2">Generating personalized recommendations...</p></div>';
            aiRecommendationsContainer.classList.remove('d-none');
            
            // Simulate AI processing time
            setTimeout(() => {
                aiRecommendationsContainer.innerHTML = `
                    <div class="card">
                        <div class="card-header bg-primary text-white">
                            <h5 class="mb-0">AI-Generated Learning Recommendations</h5>
                        </div>
                        <div class="card-body">
                            <h6 class="card-subtitle mb-3 text-muted">Personalized resources for John Doe based on learning patterns and performance analytics</h6>
                            
                            <div class="mb-4">
                                <h6 class="border-bottom pb-2">For Computer Science Courses</h6>
                                <ul class="list-group">
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>Data Structures: Advanced Tree Algorithms</strong>
                                            <p class="mb-0 small text-muted">Supplementary material to strengthen understanding of AVL trees and B-trees</p>
                                        </div>
                                        <a href="#" class="btn btn-sm btn-outline-primary">Access</a>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>Database Management: Normalization Tutorial</strong>
                                            <p class="mb-0 small text-muted">Interactive tutorial with practice problems on 3NF normalization</p>
                                        </div>
                                        <a href="#" class="btn btn-sm btn-outline-primary">Access</a>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>Web Development: Modern JavaScript Frameworks</strong>
                                            <p class="mb-0 small text-muted">Practical guides on React, Angular, and Vue.js with sample projects</p>
                                        </div>
                                        <a href="#" class="btn btn-sm btn-outline-primary">Access</a>
                                    </li>
                                </ul>
                            </div>
                            
                            <div class="mb-4">
                                <h6 class="border-bottom pb-2">For Mathematics Improvement</h6>
                                <ul class="list-group">
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>Discrete Mathematics: Graph Theory Practice</strong>
                                            <p class="mb-0 small text-muted">Additional exercises on graph algorithms and properties</p>
                                        </div>
                                        <a href="#" class="btn btn-sm btn-outline-primary">Access</a>
                                    </li>
                                </ul>
                            </div>
                            
                            <div class="mb-4">
                                <h6 class="border-bottom pb-2">Learning Style Recommendations</h6>
                                <p>Based on your interaction patterns, you learn best through visual and hands-on approaches. Consider:</p>
                                <ul>
                                    <li>Utilizing the university's virtual lab environments for practical exercises</li>
                                    <li>Joining the peer programming sessions on Thursdays at 4 PM</li>
                                    <li>Using visual learning tools like diagrams and flowcharts for complex algorithms</li>
                                </ul>
                            </div>
                            
                            <div class="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                                <button class="btn btn-primary me-md-2" type="button" id="sendRecommendationsBtn">Send to Student</button>
                                <button class="btn btn-outline-secondary" type="button" id="closeRecommendationsBtn">Close</button>
                            </div>
                        </div>
                    </div>
                `;
                
                // Add event listeners for the buttons
                document.getElementById('sendRecommendationsBtn').addEventListener('click', function() {
                    showAlert('Recommendations sent to student\'s email and learning dashboard.', 'success');
                    aiRecommendationsContainer.classList.add('d-none');
                });
                
                document.getElementById('closeRecommendationsBtn').addEventListener('click', function() {
                    aiRecommendationsContainer.classList.add('d-none');
                });
            }, 2000);
        }
    }

    // Handle message form submission
    const messageForm = document.getElementById('messageForm');
    if (messageForm) {
        messageForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const studentId = document.getElementById('messageStudentId').value;
            const messageText = document.getElementById('messageText').value;
            
            if (messageText) {
                // In a real application, this would send the message to an API
                // For now, just close the modal and show a success message
                bootstrap.Modal.getInstance(document.getElementById('messageModal')).hide();
                showAlert('Message sent successfully!', 'success');
            } else {
                showAlert('Please enter a message.', 'danger', 'messageAlertContainer');
            }
        });
    }

    // Function to show alerts
    function showAlert(message, type, containerId = 'alertContainer') {
        const alertContainer = document.getElementById(containerId);
        if (alertContainer) {
            const alert = document.createElement('div');
            alert.className = `alert alert-${type} alert-dismissible fade show`;
            alert.role = 'alert';
            alert.innerHTML = `
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            `;
            
            alertContainer.appendChild(alert);
            
            // Auto-dismiss after 5 seconds
            setTimeout(() => {
                alert.classList.remove('show');
                setTimeout(() => {
                    alert.remove();
                }, 150);
            }, 5000);
        }
    }

    // Initialize search functionality
    const searchInput = document.getElementById('searchStudents');
    if (searchInput) {
        searchInput.addEventListener('keyup', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('#studentsList tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }

    // AI-assisted student group management
    const generateGroupsBtn = document.getElementById('generateGroupsBtn');
    if (generateGroupsBtn) {
        generateGroupsBtn.addEventListener('click', function() {
            const groupSize = document.getElementById('groupSizeInput').value;
            const criteria = document.getElementById('groupingCriteriaSelect').value;
            
            if (groupSize && criteria) {
                const aiGroupsContainer = document.getElementById('aiGroupsContainer');
                
                if (aiGroupsContainer) {
                    // Show loading indicator
                    aiGroupsContainer.innerHTML = '<div class="text-center my-4"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div><p class="mt-2">Generating optimal student groups...</p></div>';
                    aiGroupsContainer.classList.remove('d-none');
                    
                    // Simulate AI processing time
                    setTimeout(() => {
                        aiGroupsContainer.innerHTML = `
                            <div class="card">
                                <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                                    <h5 class="mb-0">AI-Generated Student Groups</h5>
                                    <button type="button" class="btn-close btn-close-white" aria-label="Close" id="closeGroupsBtn"></button>
                                </div>
                                <div class="card-body">
                                    <div class="alert alert-info">
                                        <i class="fas fa-info-circle me-2"></i> Groups were created based on ${criteria} with balanced skill levels in each group.
                                    </div>
                                    
                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <div class="card h-100">
                                                <div class="card-header bg-light">
                                                    <h6 class="mb-0">Group 1</h6>
                                                </div>
                                                <div class="card-body">
                                                    <ul class="list-group list-group-flush">
                                                        <li class="list-group-item d-flex justify-content-between align-items-center">
                                                            John Doe
                                                            <span class="badge bg-success">Strong: Databases</span>
                                                        </li>
                                                        <li class="list-group-item d-flex justify-content-between align-items-center">
                                                            Michael Johnson
                                                            <span class="badge bg-success">Strong: Algorithms</span>
                                                        </li>
                                                        <li class="list-group-item d-flex justify-content-between align-items-center">
                                                            Sarah Brown
                                                            <span class="badge bg-success">Strong: UI/UX</span>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div class="col-md-6 mb-3">
                                            <div class="card h-100">
                                                <div class="card-header bg-light">
                                                    <h6 class="mb-0">Group 2</h6>
                                                </div>
                                                <div class="card-body">
                                                    <ul class="list-group list-group-flush">
                                                        <li class="list-group-item d-flex justify-content-between align-items-center">
                                                            Jane Smith
                                                            <span class="badge bg-success">Strong: Databases</span>
                                                        </li>
                                                        <li class="list-group-item d-flex justify-content-between align-items-center">
                                                            Emily Davis
                                                            <span class="badge bg-success">Strong: Algorithms</span>
                                                        </li>
                                                        <li class="list-group-item d-flex justify-content-between align-items-center">
                                                            David Miller
                                                            <span class="badge bg-success">Strong: UI/UX</span>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div class="col-md-6 mb-3">
                                            <div class="card h-100">
                                                <div class="card-header bg-light">
                                                    <h6 class="mb-0">Group 3</h6>
                                                </div>
                                                <div class="card-body">
                                                    <ul class="list-group list-group-flush">
                                                        <li class="list-group-item d-flex justify-content-between align-items-center">
                                                            Robert Wilson
                                                            <span class="badge bg-success">Strong: Backend</span>
                                                        </li>
                                                        <li class="list-group-item d-flex justify-content-between align-items-center">
                                                            Jennifer White
                                                            <span class="badge bg-success">Strong: Frontend</span>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                                        <button class="btn btn-primary me-md-2" type="button" id="applyGroupsBtn">Apply Groups</button>
                                        <button class="btn btn-outline-secondary" type="button" id="regenerateGroupsBtn">Regenerate</button>
                                    </div>
                                </div>
                            </div>
                        `;
                        
                        // Add event listeners for the new buttons
                        document.getElementById('closeGroupsBtn').addEventListener('click', function() {
                            aiGroupsContainer.classList.add('d-none');
                        });
                        
                        document.getElementById('applyGroupsBtn').addEventListener('click', function() {
                            showAlert('Groups have been created and notifications sent to students.', 'success');
                            aiGroupsContainer.classList.add('d-none');
                        });
                        
                        document.getElementById('regenerateGroupsBtn').addEventListener('click', function() {
                            // This would regenerate groups with different criteria
                            showAlert('Regenerating groups with new parameters...', 'info');
                        });
                    }, 2000);
                }
            } else {
                showAlert('Please specify group size and criteria.', 'warning');
            }
        });
    }

    // Load students when the page loads
    loadStudents();
});

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize date pickers if any
    const datePickers = document.querySelectorAll('.datepicker');
    datePickers.forEach(input => {
        // In a real application, you would use a date picker library
        // For now, we'll just set the type to date
        input.type = 'date';
    });

    // Add event listener to assignment creation form
    const assignmentForm = document.getElementById('assignmentForm');
    if (assignmentForm) {
        assignmentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(assignmentForm);
            
            // In a real application, this would be an API call to save the assignment
            // For now, just show a success message
            showAlert('Assignment created successfully!', 'success');
            assignmentForm.reset();
        });
    }

    // Add event listener to assignment filter form
    const filterForm = document.getElementById('filterForm');
    if (filterForm) {
        filterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // In a real application, this would filter the assignments
            // For now, we'll just reload the list
            loadAssignments();
        });
    }

    // Function to load assignments
    function loadAssignments() {
        // In a real application, this would be an API call
        // For now, we'll just simulate it
        const assignments = [
            { id: 1, title: 'Database Design Project', course: 'Database Management', deadline: '2023-06-15', status: 'Open', submissions: 15, totalStudents: 30 },
            { id: 2, title: 'Algorithm Analysis Essay', course: 'Data Structures', deadline: '2023-06-10', status: 'Open', submissions: 25, totalStudents: 28 },
            { id: 3, title: 'Web Portfolio', course: 'Web Development', deadline: '2023-06-05', status: 'Closed', submissions: 30, totalStudents: 30 },
            { id: 4, title: 'Network Security Assessment', course: 'Cybersecurity', deadline: '2023-06-20', status: 'Open', submissions: 10, totalStudents: 25 }
        ];

        const assignmentsList = document.getElementById('assignmentsList');
        if (assignmentsList) {
            assignmentsList.innerHTML = '';

            if (assignments.length === 0) {
                assignmentsList.innerHTML = '<tr><td colspan="6" class="text-center">No assignments found</td></tr>';
                return;
            }

            assignments.forEach(assignment => {
                const submissionRate = (assignment.submissions / assignment.totalStudents) * 100;
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${assignment.title}</td>
                    <td>${assignment.course}</td>
                    <td>${assignment.deadline}</td>
                    <td>
                        <span class="badge bg-${assignment.status === 'Open' ? 'success' : 'secondary'}">${assignment.status}</span>
                    </td>
                    <td>
                        <div class="progress">
                            <div class="progress-bar" role="progressbar" style="width: ${submissionRate}%;" 
                                aria-valuenow="${submissionRate}" aria-valuemin="0" aria-valuemax="100">
                                ${assignment.submissions}/${assignment.totalStudents}
                            </div>
                        </div>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-primary view-btn" data-id="${assignment.id}" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-success grade-btn" data-id="${assignment.id}" title="Grade Submissions">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn btn-sm btn-info edit-btn" data-id="${assignment.id}" title="Edit Assignment">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${assignment.id}" title="Delete Assignment">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                
                assignmentsList.appendChild(row);
            });

            // Add event listeners to the buttons
            document.querySelectorAll('.view-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const assignmentId = this.getAttribute('data-id');
                    window.location.href = `/assignment/${assignmentId}`;
                });
            });

            document.querySelectorAll('.grade-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const assignmentId = this.getAttribute('data-id');
                    window.location.href = `/assignment/${assignmentId}/submissions`;
                });
            });

            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const assignmentId = this.getAttribute('data-id');
                    // In a real application, this would load the assignment data into the form
                    showAlert('Edit functionality would be implemented in a real application', 'info');
                });
            });

            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const assignmentId = this.getAttribute('data-id');
                    if (confirm('Are you sure you want to delete this assignment?')) {
                        // In a real application, this would delete the assignment
                        showAlert('Delete functionality would be implemented in a real application', 'info');
                    }
                });
            });
        }
    }

    // Function to show alerts
    function showAlert(message, type) {
        const alertContainer = document.getElementById('alertContainer');
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

    // Load assignments when the page loads
    loadAssignments();

    // Initialize AI assistant
    const aiAssistantBtn = document.getElementById('aiAssistantBtn');
    if (aiAssistantBtn) {
        aiAssistantBtn.addEventListener('click', function() {
            // In a real application, this would call an AI service
            // For now, just show a sample response
            const aiResponseContainer = document.getElementById('aiResponseContainer');
            if (aiResponseContainer) {
                aiResponseContainer.classList.remove('d-none');
                document.getElementById('aiResponse').innerHTML = `<p>Here's a draft assignment based on your course objectives:</p>
                <p><strong>Title:</strong> Database Normalization Exercise</p>
                <p><strong>Description:</strong> In this assignment, students will apply normalization techniques to convert a denormalized database schema into 3NF. Students should identify functional dependencies, apply 1NF, 2NF, and 3NF rules, and create a properly normalized schema.</p>
                <p><strong>Suggested Deadline:</strong> 2 weeks from today</p>
                <p><strong>Grading Rubric:</strong></p>
                <ul>
                    <li>Correct identification of functional dependencies (20%)</li>
                    <li>Proper application of 1NF rules (20%)</li>
                    <li>Proper application of 2NF rules (20%)</li>
                    <li>Proper application of 3NF rules (20%)</li>
                    <li>Overall schema design and documentation (20%)</li>
                </ul>`;
            }
        });
    }
});

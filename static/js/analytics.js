document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Performance Overview Chart
    const performanceCtx = document.getElementById('performanceOverviewChart');
    if (performanceCtx) {
        new Chart(performanceCtx, {
            type: 'bar',
            data: {
                labels: ['Database Systems', 'Data Structures', 'Web Development', 'Machine Learning', 'Computer Networks'],
                datasets: [{
                    label: 'Class Average',
                    data: [78, 82, 88, 75, 80],
                    backgroundColor: 'rgba(13, 110, 253, 0.7)',
                    borderColor: 'rgba(13, 110, 253, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Score (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Courses'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Class Performance Overview'
                    }
                }
            }
        });
    }

    // Submission Timeline Chart
    const submissionCtx = document.getElementById('submissionTimelineChart');
    if (submissionCtx) {
        new Chart(submissionCtx, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
                datasets: [{
                    label: 'On-time Submissions',
                    data: [90, 85, 82, 78, 88, 92, 86, 80],
                    borderColor: 'rgba(25, 135, 84, 1)',
                    backgroundColor: 'rgba(25, 135, 84, 0.1)',
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Late Submissions',
                    data: [10, 15, 18, 22, 12, 8, 14, 20],
                    borderColor: 'rgba(220, 53, 69, 1)',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Percentage (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Academic Period'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Assignment Submission Timeline'
                    }
                }
            }
        });
    }

    // Student Engagement Chart
    const engagementCtx = document.getElementById('studentEngagementChart');
    if (engagementCtx) {
        new Chart(engagementCtx, {
            type: 'radar',
            data: {
                labels: [
                    'Attendance',
                    'Participation',
                    'Assignment Completion',
                    'Forum Activity',
                    'Resource Usage',
                    'Peer Collaboration'
                ],
                datasets: [{
                    label: 'Class Average',
                    data: [85, 70, 90, 65, 75, 80],
                    fill: true,
                    backgroundColor: 'rgba(13, 110, 253, 0.2)',
                    borderColor: 'rgba(13, 110, 253, 1)',
                    pointBackgroundColor: 'rgba(13, 110, 253, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(13, 110, 253, 1)'
                }]
            },
            options: {
                elements: {
                    line: {
                        borderWidth: 3
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Student Engagement Metrics'
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
                }
            }
        });
    }

    // At-Risk Students Chart
    const atRiskCtx = document.getElementById('atRiskStudentsChart');
    if (atRiskCtx) {
        new Chart(atRiskCtx, {
            type: 'doughnut',
            data: {
                labels: [
                    'Low Risk',
                    'Medium Risk',
                    'High Risk'
                ],
                datasets: [{
                    label: 'Student Risk Distribution',
                    data: [70, 20, 10],
                    backgroundColor: [
                        'rgba(25, 135, 84, 0.7)',
                        'rgba(255, 193, 7, 0.7)',
                        'rgba(220, 53, 69, 0.7)'
                    ],
                    borderColor: [
                        'rgba(25, 135, 84, 1)',
                        'rgba(255, 193, 7, 1)',
                        'rgba(220, 53, 69, 1)'
                    ],
                    borderWidth: 1
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
                        text: 'Student Risk Distribution'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((acc, data) => acc + data, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${percentage}% (${value} students)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // AI Insights
    const insightsList = document.getElementById('aiInsightsList');
    if (insightsList) {
        // These would be retrieved from an AI system in a real application
        const insights = [
            {
                title: "At-Risk Student Identification",
                description: "10 students have shown declining performance trends over the last 3 weeks, with average scores dropping by more than 15%.",
                recommendation: "Consider scheduling individual meetings with these students to address challenges.",
                severity: "high"
            },
            {
                title: "Assignment Difficulty Analysis",
                description: "Assignment #4 in Data Structures has a significantly lower average score (65%) compared to other assignments (85%).",
                recommendation: "Review assignment difficulty or provide additional resources for this topic.",
                severity: "medium"
            },
            {
                title: "Engagement Pattern",
                description: "Students who participate in forum discussions show 20% higher performance on related assignments.",
                recommendation: "Encourage more forum participation through guided discussions.",
                severity: "low"
            },
            {
                title: "Content Effectiveness",
                description: "Video lectures on Database Normalization have higher engagement (92% completion) compared to text resources (45% access).",
                recommendation: "Consider creating more video content for complex topics.",
                severity: "low"
            }
        ];

        insights.forEach(insight => {
            const card = document.createElement('div');
            card.className = 'card mb-3';
            card.innerHTML = `
                <div class="card-header bg-${getSeverityColor(insight.severity)}">
                    <h5 class="card-title mb-0 text-white">${insight.title}</h5>
                </div>
                <div class="card-body">
                    <p class="card-text">${insight.description}</p>
                    <p class="card-text"><strong>Recommendation:</strong> ${insight.recommendation}</p>
                </div>
            `;
            insightsList.appendChild(card);
        });
    }

    // Helper function to get severity color
    function getSeverityColor(severity) {
        switch(severity) {
            case 'high':
                return 'danger';
            case 'medium':
                return 'warning';
            case 'low':
                return 'success';
            default:
                return 'primary';
        }
    }

    // Initialize AI recommendation feature
    const generateReportBtn = document.getElementById('generateReportBtn');
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', function() {
            const reportContainer = document.getElementById('aiReportContainer');
            const reportContent = document.getElementById('aiReportContent');
            
            // Show loading indicator
            reportContent.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div><p class="mt-2">Generating comprehensive report...</p></div>';
            reportContainer.classList.remove('d-none');
            
            // Simulate AI processing time
            setTimeout(() => {
                reportContent.innerHTML = `
                    <h4>Performance Analysis Report</h4>
                    <p class="text-muted">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
                    
                    <h5 class="mt-4">Executive Summary</h5>
                    <p>This AI-generated report analyzes the performance data from your courses over the current semester. Overall, student performance is strong with an average score of 80.6% across all courses. However, there are several areas that require attention.</p>
                    
                    <h5 class="mt-4">Key Findings</h5>
                    <ul>
                        <li>The Web Development course shows the highest performance metrics, with 88% average scores and 95% assignment completion rate.</li>
                        <li>The Machine Learning course has the lowest performance at 75%, with particular challenges in the neural network assignments.</li>
                        <li>10 students (8% of total enrollment) are at high risk of underperforming, with consistent scores below 65%.</li>
                        <li>Late submission rates have increased from 10% to 20% over the last 3 weeks, particularly in Database Systems and Computer Networks.</li>
                    </ul>
                    
                    <h5 class="mt-4">Recommended Actions</h5>
                    <ol>
                        <li>Schedule intervention meetings with the 10 high-risk students within the next week.</li>
                        <li>Review the difficulty level and resources for neural network assignments in the Machine Learning course.</li>
                        <li>Implement a mid-week reminder system for upcoming deadlines to reduce late submissions.</li>
                        <li>Consider offering additional office hours for Database Systems and Computer Networks courses.</li>
                    </ol>
                    
                    <h5 class="mt-4">Predicted Outcomes</h5>
                    <p>Based on current trends and if recommended actions are implemented, we predict:</p>
                    <ul>
                        <li>Overall performance improvement of 5-7% by the end of the semester.</li>
                        <li>Reduction in at-risk students from 10 to 4-5.</li>
                        <li>Decrease in late submission rates to below 10%.</li>
                    </ul>
                    
                    <div class="text-center mt-4">
                        <button class="btn btn-primary me-2">Download Full Report</button>
                        <button class="btn btn-outline-secondary">Schedule Follow-up Analysis</button>
                    </div>
                `;
            }, 2000);
        });
    }
});

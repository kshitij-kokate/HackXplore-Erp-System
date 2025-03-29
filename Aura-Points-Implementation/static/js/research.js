// research.js - Functionality for the research discovery feature

document.addEventListener('DOMContentLoaded', function() {
    // Initialize research functionality if on the research page
    if (document.getElementById('research-recommendations')) {
        initResearchPage();
    }
});

// Initialize the research page
function initResearchPage() {
    // Load initial paper recommendations
    loadPaperRecommendations();
    
    // Set up event listeners
    setupResearchListeners();
    
    // Setup PDF upload functionality
    setupPdfUploadListeners();
}

// Set up event listeners for the research page
function setupResearchListeners() {
    // Handle paper search
    const searchForm = document.getElementById('paper-search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchInput = document.getElementById('paper-search-input');
            if (searchInput && searchInput.value.trim()) {
                showLoading('search-results');
                searchPapers(searchInput.value);
            }
        });
    }
    
    // Handle collaborator search button
    const findCollaboratorsBtn = document.getElementById('find-collaborators-btn');
    if (findCollaboratorsBtn) {
        findCollaboratorsBtn.addEventListener('click', function() {
            showLoading('potential-collaborators');
            findPotentialCollaborators();
        });
    }
}

// Load paper recommendations
function loadPaperRecommendations() {
    showLoading('research-recommendations');
    
    // In a real app, this would be an API call
    // For this demo, we'll simulate a response
    setTimeout(() => {
        fetch('/api/research/recommendations')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load recommendations');
                }
                return response.json();
            })
            .then(data => {
                displayPaperRecommendations(data.papers);
            })
            .catch(error => {
                console.error('Error:', error);
                showError('research-recommendations', 'Failed to load paper recommendations. Please try again later.');
            });
    }, 600);
}

// Search for papers
function searchPapers(query) {
    // In a real app, this would be an API call
    // For this demo, we'll simulate a response
    setTimeout(() => {
        fetch(`/api/research/search?q=${encodeURIComponent(query)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to search papers');
                }
                return response.json();
            })
            .then(data => {
                displaySearchResults(data.papers, query);
            })
            .catch(error => {
                console.error('Error:', error);
                showError('search-results', 'Failed to search papers. Please try again later.');
            });
    }, 800);
}

// Find similar papers
function findSimilarPapers(paperId) {
    showLoading('similar-papers');
    
    // In a real app, this would be an API call
    // For this demo, we'll simulate a response
    setTimeout(() => {
        fetch(`/api/research/similar?paper_id=${paperId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to find similar papers');
                }
                return response.json();
            })
            .then(data => {
                displaySimilarPapers(data.papers);
            })
            .catch(error => {
                console.error('Error:', error);
                showError('similar-papers', 'Failed to find similar papers. Please try again later.');
            });
    }, 700);
}

// Get key findings from a paper
function getKeyFindings(paperId) {
    showLoading(`key-findings-${paperId}`);
    
    // In a real app, this would be an API call
    // For this demo, we'll simulate a response
    setTimeout(() => {
        fetch(`/api/research/key-findings?paper_id=${paperId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to get key findings');
                }
                return response.json();
            })
            .then(data => {
                displayKeyFindings(paperId, data.findings);
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById(`key-findings-${paperId}`).innerHTML = `
                    <div class="alert alert-danger">
                        Failed to load key findings. Please try again later.
                    </div>
                `;
            });
    }, 600);
}

// Find potential collaborators
function findPotentialCollaborators() {
    // In a real app, this would be an API call
    // For this demo, we'll simulate a response
    setTimeout(() => {
        fetch('/api/research/collaborators')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to find potential collaborators');
                }
                return response.json();
            })
            .then(data => {
                displayPotentialCollaborators(data.collaborators);
            })
            .catch(error => {
                console.error('Error:', error);
                showError('potential-collaborators', 'Failed to find potential collaborators. Please try again later.');
            });
    }, 700);
}

// Display paper recommendations
function displayPaperRecommendations(papers) {
    const container = document.getElementById('research-recommendations');
    
    if (!papers || papers.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                No paper recommendations available. Update your research interests to get personalized recommendations.
            </div>
        `;
        return;
    }
    
    container.innerHTML = createPapersList(papers);
}

// Display search results
function displaySearchResults(papers, query) {
    const container = document.getElementById('search-results');
    
    if (!papers || papers.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                No papers found matching "${escapeHtml(query)}". Try different keywords.
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <h4>Search Results for "${escapeHtml(query)}"</h4>
        ${createPapersList(papers)}
    `;
}

// Display similar papers
function displaySimilarPapers(papers) {
    const container = document.getElementById('similar-papers');
    
    if (!papers || papers.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                No similar papers found. This paper may be unique in our database.
            </div>
        `;
        return;
    }
    
    container.innerHTML = createPapersList(papers);
}

// Display key findings
function displayKeyFindings(paperId, findings) {
    const container = document.getElementById(`key-findings-${paperId}`);
    
    if (!findings || findings.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                No key findings could be extracted from this paper.
            </div>
        `;
        return;
    }
    
    let html = `
        <ul class="list-group list-group-flush">
    `;
    
    findings.forEach(finding => {
        html += `
            <li class="list-group-item">${escapeHtml(finding)}</li>
        `;
    });
    
    html += `
        </ul>
    `;
    
    container.innerHTML = html;
}

// Display potential collaborators
function displayPotentialCollaborators(collaborators) {
    const container = document.getElementById('potential-collaborators');
    
    if (!collaborators || collaborators.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                No potential collaborators found. Update your research interests to find matches.
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="list-group">
    `;
    
    collaborators.forEach(user => {
        const interestOrAreas = user.role === 'student' ? 
            createTags(user.interests, 'info') : 
            createTags(user.research_areas, 'primary');
        
        html += `
            <div class="list-group-item">
                <div class="d-flex justify-content-between align-items-center">
                    <h5 class="mb-1">${escapeHtml(user.username)}</h5>
                    <span class="badge bg-secondary">${escapeHtml(user.role)}</span>
                </div>
                <p class="mb-1">${escapeHtml(user.email)}</p>
                <small>
                    ${user.role === 'student' ? 'Interests: ' : 'Research Areas: '}
                    ${interestOrAreas}
                </small>
                <div class="mt-2">
                    <button class="btn btn-sm btn-outline-primary">
                        <i class="fas fa-envelope me-1"></i> Contact
                    </button>
                    <button class="btn btn-sm btn-outline-secondary">
                        <i class="fas fa-user me-1"></i> View Profile
                    </button>
                </div>
            </div>
        `;
    });
    
    html += `
        </div>
    `;
    
    container.innerHTML = html;
}

// Set up PDF upload form functionality
function setupPdfUploadListeners() {
    const pdfUploadForm = document.getElementById('pdf-upload-form');
    const pdfAnalysisResults = document.getElementById('pdf-analysis-results');
    const closePdfAnalysisBtn = document.getElementById('close-pdf-analysis');
    
    if (pdfUploadForm) {
        pdfUploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show loading state
            pdfUploadForm.classList.add('was-validated');
            const submitBtn = pdfUploadForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Analyzing PDF...
            `;
            
            // Create FormData object from the form
            const formData = new FormData(pdfUploadForm);
            
            // Submit the form data via fetch
            fetch('/api/research/upload-pdf', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to upload PDF');
                }
                return response.json();
            })
            .then(data => {
                // Reset form and loading state
                pdfUploadForm.reset();
                pdfUploadForm.classList.remove('was-validated');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                
                // Display the results
                displayPdfAnalysisResults(data);
            })
            .catch(error => {
                console.error('Error:', error);
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                
                showToast('Error', 'Failed to analyze PDF. Please try again.', 'danger');
            });
        });
    }
    
    // Handle closing the PDF analysis results
    if (closePdfAnalysisBtn) {
        closePdfAnalysisBtn.addEventListener('click', function() {
            if (pdfAnalysisResults) {
                pdfAnalysisResults.style.display = 'none';
            }
        });
    }
}

// Display PDF analysis results
function displayPdfAnalysisResults(data) {
    const pdfAnalysisResults = document.getElementById('pdf-analysis-results');
    const pdfAnalysisContent = document.getElementById('pdf-analysis-content');
    const pdfFileName = document.querySelector('.pdf-file-name');
    const pdfAnalysisType = document.querySelector('.pdf-analysis-type');
    
    if (!pdfAnalysisResults || !pdfAnalysisContent) return;
    
    // Update file name and analysis type
    if (pdfFileName) {
        pdfFileName.textContent = data.filename || 'Uploaded PDF';
    }
    
    if (pdfAnalysisType) {
        let analysisTypeText = 'Summary';
        if (data.analysis_type === 'literature-review') analysisTypeText = 'Literature Review';
        else if (data.analysis_type === 'key-findings') analysisTypeText = 'Key Findings';
        else if (data.analysis_type === 'methodology') analysisTypeText = 'Methodology Analysis';
        
        pdfAnalysisType.textContent = analysisTypeText;
    }
    
    // Show the results section
    pdfAnalysisResults.style.display = 'block';
    
    // Display content based on success/error
    if (data.success) {
        const result = data.result;
        
        // Format the display based on result type
        if (data.analysis_type === 'key-findings' || data.analysis_type === 'methodology') {
            // For array results (key findings or methodology)
            let html = `<div class="card">
                <div class="card-body">
                    <ol class="mb-0">`;
            
            // Check if result is an array
            if (Array.isArray(result)) {
                result.forEach(item => {
                    html += `<li class="mb-2">${escapeHtml(item)}</li>`;
                });
            } else {
                html += `<li>${escapeHtml(result)}</li>`;
            }
            
            html += `</ol>
                </div>
            </div>`;
            
            pdfAnalysisContent.innerHTML = html;
        } else {
            // For text results (summary or literature review)
            const paragraphs = result.split("\n\n");
            let html = `<div class="card">
                <div class="card-body">`;
            
            if (paragraphs.length > 1) {
                paragraphs.forEach(paragraph => {
                    if (paragraph.trim()) {
                        html += `<p>${escapeHtml(paragraph)}</p>`;
                    }
                });
            } else {
                html += `<p>${escapeHtml(result)}</p>`;
            }
            
            html += `</div>
            </div>`;
            
            pdfAnalysisContent.innerHTML = html;
        }
        
        // Add download link if available
        if (data.file_path) {
            pdfAnalysisContent.innerHTML += `
                <div class="mt-3">
                    <a href="${data.file_path}" class="btn btn-primary" target="_blank">
                        <i class="fas fa-download me-1"></i>
                        Download PDF
                    </a>
                </div>
            `;
        }
    } else {
        // Display error message
        pdfAnalysisContent.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle me-2"></i>
                ${escapeHtml(data.error || 'Failed to analyze PDF')}
            </div>
        `;
    }
    
    // Scroll to the results
    pdfAnalysisResults.scrollIntoView({ behavior: 'smooth' });
}

// Create a list of papers
function createPapersList(papers) {
    let html = `
        <div class="list-group">
    `;
    
    papers.forEach(paper => {
        html += `
            <div class="list-group-item list-group-item-action flex-column align-items-start">
                <div class="d-flex justify-content-between align-items-center">
                    <h5 class="mb-1">${escapeHtml(paper.title)}</h5>
                    <small>Citations: ${paper.citations}</small>
                </div>
                <p class="mb-1">
                    <strong>Authors:</strong> ${escapeHtml(paper.authors.join(', '))}
                </p>
                <p class="mb-1">
                    <small>${escapeHtml(paper.journal)} (${paper.publication_date})</small>
                </p>
                <p class="mb-1">${escapeHtml(paper.abstract)}</p>
                <div class="mt-2 mb-2">
                    ${createTags(paper.keywords, 'info')}
                </div>
                <div class="accordion" id="paper-accordion-${paper.id}">
                    <div class="accordion-item">
                        <h2 class="accordion-header" id="heading-key-findings-${paper.id}">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" 
                                data-bs-target="#collapse-key-findings-${paper.id}" 
                                aria-expanded="false" aria-controls="collapse-key-findings-${paper.id}"
                                onclick="getKeyFindings(${paper.id})">
                                Key Findings
                            </button>
                        </h2>
                        <div id="collapse-key-findings-${paper.id}" class="accordion-collapse collapse" 
                            aria-labelledby="heading-key-findings-${paper.id}" 
                            data-bs-parent="#paper-accordion-${paper.id}">
                            <div class="accordion-body" id="key-findings-${paper.id}">
                                <div class="text-center">
                                    <div class="spinner-border spinner-border-sm text-primary" role="status">
                                        <span class="visually-hidden">Loading...</span>
                                    </div>
                                    Loading key findings...
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mt-2">
                    <button class="btn btn-sm btn-outline-primary" onclick="findSimilarPapers(${paper.id})">
                        <i class="fas fa-search me-1"></i> Find Similar
                    </button>
                    <button class="btn btn-sm btn-outline-secondary">
                        <i class="fas fa-book-open me-1"></i> Read Full Text
                    </button>
                    <button class="btn btn-sm btn-outline-info">
                        <i class="fas fa-save me-1"></i> Save
                    </button>
                </div>
            </div>
        `;
    });
    
    html += `
        </div>
    `;
    
    return html;
}

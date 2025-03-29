/**
 * AI Teaching Assistant Integration for AI-Powered College ERP System
 * Handles chat functionality and quiz generation
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeChat();
    setupQuizGenerator();
    setupChatInterface();
});

// Chat variables
let chatMessages = [];
let currentCourse = null;

/**
 * Initialize the chat interface
 */
function initializeChat() {
    const chatInput = document.getElementById('chatInput');
    const sendChatBtn = document.getElementById('sendChatBtn');
    
    if (chatInput && sendChatBtn) {
        // Send message on button click
        sendChatBtn.addEventListener('click', function() {
            sendMessage();
        });
        
        // Send message on Enter key
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // Course selection change
        const courseSelect = document.getElementById('courseSelect');
        if (courseSelect) {
            courseSelect.addEventListener('change', function() {
                currentCourse = this.value;
                const welcomeMsg = `Now chatting about: ${currentCourse}`;
                appendSystemMessage(welcomeMsg);
            });
        }
    }
}

/**
 * Send a message to the AI assistant
 */
function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const messageText = chatInput.value.trim();
    
    if (messageText === '') return;
    
    // Display user message
    appendUserMessage(messageText);
    
    // Add to messages array
    chatMessages.push({
        role: 'user',
        content: messageText
    });
    
    // Clear input
    chatInput.value = '';
    
    // Show typing indicator
    appendTypingIndicator();
    
    // Send to API
    sendChatToAPI(chatMessages, currentCourse);
}

/**
 * Send chat to API
 */
function sendChatToAPI(messages, courseContext) {
    fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            messages: messages,
            course_context: courseContext
        }),
    })
    .then(response => response.json())
    .then(data => {
        // Remove typing indicator
        removeTypingIndicator();
        
        if (data.success) {
            // Display AI response
            appendAIMessage(data.response);
            
            // Add to messages array
            chatMessages.push({
                role: 'assistant',
                content: data.response
            });
        } else {
            // Show error
            appendErrorMessage('Sorry, I encountered an error: ' + data.error);
        }
    })
    .catch(error => {
        // Remove typing indicator
        removeTypingIndicator();
        
        // Show error
        appendErrorMessage('Failed to communicate with the AI assistant. Please try again.');
        console.error('Error:', error);
    });
}

/**
 * Append a user message to the chat
 */
function appendUserMessage(message) {
    const chatLog = document.getElementById('chatLog');
    if (!chatLog) return;
    
    const messageHtml = `
        <div class="chat-message user-message">
            <div class="message-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="message-content">
                <div class="message-text">
                    ${escapeHtml(message)}
                </div>
                <div class="message-time">
                    ${getCurrentTime()}
                </div>
            </div>
        </div>
    `;
    
    chatLog.insertAdjacentHTML('beforeend', messageHtml);
    scrollChatToBottom();
}

/**
 * Append an AI assistant message to the chat
 */
function appendAIMessage(message) {
    const chatLog = document.getElementById('chatLog');
    if (!chatLog) return;
    
    // Convert markdown-like formatting (basic)
    const formattedMessage = formatMessageText(message);
    
    const messageHtml = `
        <div class="chat-message ai-message">
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="message-text">
                    ${formattedMessage}
                </div>
                <div class="message-time">
                    ${getCurrentTime()}
                </div>
            </div>
        </div>
    `;
    
    chatLog.insertAdjacentHTML('beforeend', messageHtml);
    scrollChatToBottom();
}

/**
 * Append a system message to the chat
 */
function appendSystemMessage(message) {
    const chatLog = document.getElementById('chatLog');
    if (!chatLog) return;
    
    const messageHtml = `
        <div class="chat-message system-message">
            <div class="system-message-text">
                ${escapeHtml(message)}
            </div>
        </div>
    `;
    
    chatLog.insertAdjacentHTML('beforeend', messageHtml);
    scrollChatToBottom();
}

/**
 * Append an error message to the chat
 */
function appendErrorMessage(message) {
    const chatLog = document.getElementById('chatLog');
    if (!chatLog) return;
    
    const messageHtml = `
        <div class="chat-message error-message">
            <div class="message-avatar">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="message-content">
                <div class="message-text">
                    ${escapeHtml(message)}
                </div>
                <div class="message-time">
                    ${getCurrentTime()}
                </div>
            </div>
        </div>
    `;
    
    chatLog.insertAdjacentHTML('beforeend', messageHtml);
    scrollChatToBottom();
}

/**
 * Append a typing indicator to the chat
 */
function appendTypingIndicator() {
    const chatLog = document.getElementById('chatLog');
    if (!chatLog) return;
    
    const indicatorHtml = `
        <div id="typingIndicator" class="chat-message ai-message">
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    `;
    
    chatLog.insertAdjacentHTML('beforeend', indicatorHtml);
    scrollChatToBottom();
}

/**
 * Remove the typing indicator
 */
function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

/**
 * Scroll chat to bottom
 */
function scrollChatToBottom() {
    const chatLog = document.getElementById('chatLog');
    if (chatLog) {
        chatLog.scrollTop = chatLog.scrollHeight;
    }
}

/**
 * Get current time in HH:MM format
 */
function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Format message text with basic markdown-like syntax
 */
function formatMessageText(text) {
    // Convert ** to bold
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert * to italic
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert ``` code blocks
    text = text.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>');
    
    // Convert ` inline code
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Convert new lines to <br>
    text = text.replace(/\n/g, '<br>');
    
    return text;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Setup the quiz generator functionality
 */
function setupQuizGenerator() {
    const generateQuizBtn = document.getElementById('generateQuizBtn');
    
    if (generateQuizBtn) {
        generateQuizBtn.addEventListener('click', function() {
            const quizSubject = document.getElementById('quizSubject').value.trim();
            const quizDifficulty = document.getElementById('quizDifficulty').value;
            const quizNumQuestions = parseInt(document.getElementById('quizNumQuestions').value);
            
            if (quizSubject === '') {
                showAlert('Please enter a subject for the quiz.', 'warning');
                return;
            }
            
            // Show loading state
            document.getElementById('quizLoading').style.display = 'block';
            document.getElementById('quizResult').style.display = 'none';
            
            // Call API to generate quiz
            generateQuiz(quizSubject, quizDifficulty, quizNumQuestions);
        });
    }
}

/**
 * Generate a quiz via API
 */
function generateQuiz(subject, difficulty, numQuestions) {
    fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            subject: subject,
            difficulty: difficulty,
            num_questions: numQuestions
        }),
    })
    .then(response => response.json())
    .then(data => {
        // Hide loading state
        document.getElementById('quizLoading').style.display = 'none';
        
        if (data.success) {
            // Display quiz
            displayQuiz(data.data, subject);
        } else {
            // Show error
            showAlert('Failed to generate quiz: ' + data.error, 'danger');
        }
    })
    .catch(error => {
        // Hide loading state
        document.getElementById('quizLoading').style.display = 'none';
        
        // Show error
        showAlert('An error occurred while generating the quiz. Please try again.', 'danger');
        console.error('Error:', error);
    });
}

/**
 * Display a quiz
 */
function displayQuiz(quizData, subject) {
    const quizResult = document.getElementById('quizResult');
    const quizContainer = document.getElementById('quizContainer');
    
    if (!quizResult || !quizContainer) return;
    
    // Set quiz title
    document.getElementById('quizTitle').textContent = subject;
    
    // Clear previous quiz
    quizContainer.innerHTML = '';
    
    // Add each question
    quizData.forEach((question, index) => {
        const questionNumber = index + 1;
        
        const questionHtml = `
            <div class="card mb-3 quiz-question" data-question-id="${question.question_id || questionNumber}">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h6 class="mb-0">Question ${questionNumber}</h6>
                    <span class="badge bg-primary question-status">Unanswered</span>
                </div>
                <div class="card-body">
                    <p class="card-text question-text">${question.question_text}</p>
                    <div class="options-container">
                        ${generateOptionsHtml(question.options, questionNumber)}
                    </div>
                    <div class="explanation mt-3" style="display: none;">
                        <div class="alert alert-info">
                            <strong>Explanation:</strong> ${question.explanation || 'No explanation provided.'}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        quizContainer.insertAdjacentHTML('beforeend', questionHtml);
    });
    
    // Add event listeners to options
    document.querySelectorAll('.option-item').forEach(option => {
        option.addEventListener('click', function() {
            const questionId = this.getAttribute('data-question');
            const optionIndex = parseInt(this.getAttribute('data-option-index'));
            const questionElement = this.closest('.quiz-question');
            
            // Get correct answer
            const correctAnswerIndex = quizData[parseInt(questionId) - 1].correct_answer;
            
            // Remove previous selection
            questionElement.querySelectorAll('.option-item').forEach(opt => {
                opt.classList.remove('selected', 'correct', 'incorrect');
            });
            
            // Mark as selected
            this.classList.add('selected');
            
            // Check if correct
            if (optionIndex === correctAnswerIndex) {
                this.classList.add('correct');
                questionElement.querySelector('.question-status').textContent = 'Correct';
                questionElement.querySelector('.question-status').className = 'badge bg-success question-status';
            } else {
                this.classList.add('incorrect');
                questionElement.querySelector('.question-status').textContent = 'Incorrect';
                questionElement.querySelector('.question-status').className = 'badge bg-danger question-status';
                
                // Show correct answer
                questionElement.querySelector(`.option-item[data-option-index="${correctAnswerIndex}"]`).classList.add('correct');
            }
            
            // Show explanation
            questionElement.querySelector('.explanation').style.display = 'block';
        });
    });
    
    // Show quiz result
    quizResult.style.display = 'block';
}

/**
 * Generate options HTML
 */
function generateOptionsHtml(options, questionNumber) {
    let optionsHtml = '';
    
    options.forEach((option, index) => {
        optionsHtml += `
            <div class="option-item" data-question="${questionNumber}" data-option-index="${index}">
                <div class="option-marker">${String.fromCharCode(65 + index)}</div>
                <div class="option-text">${option}</div>
            </div>
        `;
    });
    
    return optionsHtml;
}

/**
 * Show an alert message
 */
function showAlert(message, type) {
    const alertContainer = document.getElementById('aiAlertContainer');
    if (!alertContainer) return;
    
    const alertId = 'alert-' + Date.now();
    
    const alertHtml = `
        <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    alertContainer.insertAdjacentHTML('beforeend', alertHtml);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        const alertElement = document.getElementById(alertId);
        if (alertElement) {
            alertElement.remove();
        }
    }, 5000);
}

/**
 * Setup the chat interface tabs
 */
function setupChatInterface() {
    const chatTab = document.getElementById('chatTab');
    const quizTab = document.getElementById('quizTab');
    const chatPanel = document.getElementById('chatPanel');
    const quizPanel = document.getElementById('quizPanel');
    
    if (chatTab && quizTab && chatPanel && quizPanel) {
        chatTab.addEventListener('click', function(e) {
            e.preventDefault();
            // Activate chat tab
            chatTab.classList.add('active');
            quizTab.classList.remove('active');
            
            // Show chat panel
            chatPanel.style.display = 'block';
            quizPanel.style.display = 'none';
        });
        
        quizTab.addEventListener('click', function(e) {
            e.preventDefault();
            // Activate quiz tab
            quizTab.classList.add('active');
            chatTab.classList.remove('active');
            
            // Show quiz panel
            quizPanel.style.display = 'block';
            chatPanel.style.display = 'none';
        });
    }
}
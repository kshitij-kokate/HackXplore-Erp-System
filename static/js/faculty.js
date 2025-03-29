document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    
    // Initialize popovers
    const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
    const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
    
    // Handle flash messages
    const flashMessages = document.querySelectorAll('.flash-message');
    flashMessages.forEach(function(flash) {
        const message = flash.dataset.message;
        const category = flash.dataset.category || 'info';
        showAlert(message, category);
    });
    
    // AI Assistant buttons
    const openChatBtn = document.getElementById('openChatBot');
    const chatContainer = document.getElementById('chatContainer');
    const closeChat = document.getElementById('closeChat');
    
    if (openChatBtn && chatContainer && closeChat) {
        openChatBtn.addEventListener('click', function(e) {
            e.preventDefault();
            chatContainer.style.display = 'flex';
        });
        
        closeChat.addEventListener('click', function() {
            chatContainer.style.display = 'none';
        });
    }
    
    // Quiz Generator button
    const generateQuizBtn = document.getElementById('generateQuiz');
    if (generateQuizBtn) {
        const quizModal = new bootstrap.Modal(document.getElementById('quizModal'));
        generateQuizBtn.addEventListener('click', function(e) {
            e.preventDefault();
            quizModal.show();
        });
    }
    
    // Manage Courses button
    const manageCoursesBtn = document.getElementById('manageCoursesBtn');
    if (manageCoursesBtn) {
        manageCoursesBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showAlert('Course management panel is loading...', 'info');
        });
    }
    
    // Chat messaging
    const messageInput = document.getElementById('messageInput');
    const sendMessage = document.getElementById('sendMessage');
    
    if (messageInput && sendMessage) {
        function sendChatMessage() {
            const message = messageInput.value.trim();
            if (message) {
                // Add user message
                addMessage(message, 'user');
                messageInput.value = '';
                
                // Simulate AI response
                setTimeout(() => {
                    let response;
                    if (message.toLowerCase().includes('assignment') || message.toLowerCase().includes('homework')) {
                        response = "I can help you create assignments. Would you like to generate a new assignment or get suggestions for improving an existing one?";
                    } else if (message.toLowerCase().includes('quiz') || message.toLowerCase().includes('test')) {
                        response = "I can help generate quizzes for your students. You can also use our quiz generator tool for more customization options.";
                    } else if (message.toLowerCase().includes('student') || message.toLowerCase().includes('performance')) {
                        response = "I can analyze student performance data and provide insights. Which course or student would you like to analyze?";
                    } else {
                        response = "I'm here to assist with your teaching needs. I can help with creating assignments, analyzing student performance, generating quizzes, or providing teaching resources.";
                    }
                    addMessage(response, 'bot');
                }, 1000);
            }
        }
        
        sendMessage.addEventListener('click', sendChatMessage);
        
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
    }
});

// Add message to chat
function addMessage(content, sender) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    
    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    messageContent.textContent = content;
    
    const messageTime = document.createElement('div');
    messageTime.classList.add('message-time');
    messageTime.textContent = 'Now';
    
    messageDiv.appendChild(messageContent);
    messageDiv.appendChild(messageTime);
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show a Bootstrap alert
function showAlert(message, type = 'info') {
    const alertPlaceholder = document.getElementById('alert-placeholder');
    if (!alertPlaceholder) return;
    
    const wrapper = document.createElement('div');
    
    wrapper.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            <div>${message}</div>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    alertPlaceholder.appendChild(wrapper);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        const alert = wrapper.querySelector('.alert');
        if (alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }
    }, 5000);
}
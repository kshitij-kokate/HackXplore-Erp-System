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
    
    // Learning resources button
    const startLearningBtn = document.getElementById('startLearningBtn');
    if (startLearningBtn) {
        startLearningBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showAlert('Learning resources are being loaded...', 'info');
        });
    }
});

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
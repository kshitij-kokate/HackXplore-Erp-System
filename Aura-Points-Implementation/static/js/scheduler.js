// scheduler.js - Functionality for the scheduling assistant feature

document.addEventListener('DOMContentLoaded', function() {
    // Initialize calendar if on the scheduler page
    if (document.getElementById('calendar')) {
        initCalendar();
    }
    
    // Initialize meeting form if it exists
    if (document.getElementById('meeting-form')) {
        initMeetingForm();
    }
    
    // Load schedule optimizations if the container exists
    if (document.getElementById('schedule-optimizations')) {
        loadScheduleOptimizations();
    }
});

// Initialize the calendar
function initCalendar() {
    const calendarEl = document.getElementById('calendar');
    
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        allDaySlot: false,
        slotMinTime: '08:00:00',
        slotMaxTime: '20:00:00',
        height: 'auto',
        eventTimeFormat: {
            hour: '2-digit',
            minute: '2-digit',
            meridiem: 'short'
        },
        businessHours: {
            daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
            startTime: '08:00',
            endTime: '18:00'
        },
        nowIndicator: true,
        navLinks: true,
        editable: true,
        selectable: true,
        selectMirror: true,
        select: function(info) {
            handleTimeSlotSelect(info);
        },
        eventClick: function(info) {
            handleEventClick(info);
        },
        eventDrop: function(info) {
            handleEventDrop(info);
        },
        eventResize: function(info) {
            handleEventResize(info);
        },
        events: function(info, successCallback, failureCallback) {
            loadEvents(info, successCallback, failureCallback);
        }
    });
    
    calendar.render();
    
    // Store calendar instance for later use
    window.calendar = calendar;
}

// Load events from the server
function loadEvents(info, successCallback, failureCallback) {
    // In a real app, this would be an API call with date range parameters
    // For this demo, we'll simulate a response
    fetch('/api/scheduler/meetings')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load events');
            }
            return response.json();
        })
        .then(data => {
            // Transform meetings data to FullCalendar event format
            const events = data.meetings.map(meeting => ({
                id: meeting.id,
                title: meeting.title,
                start: meeting.start_time,
                end: meeting.end_time,
                description: meeting.description,
                location: meeting.location,
                status: meeting.status,
                extendedProps: {
                    participants: meeting.participants
                },
                backgroundColor: meeting.status === 'confirmed' ? '#2c3e50' : '#7f8c8d',
                borderColor: meeting.status === 'confirmed' ? '#2c3e50' : '#7f8c8d'
            }));
            
            successCallback(events);
        })
        .catch(error => {
            console.error('Error loading events:', error);
            failureCallback(error);
            showToast('Error', 'Failed to load calendar events', 'danger');
        });
}

// Handle time slot selection
function handleTimeSlotSelect(info) {
    // Populate the meeting form with the selected time slot
    const startInput = document.getElementById('meeting-start-time');
    const endInput = document.getElementById('meeting-end-time');
    
    if (startInput && endInput) {
        startInput.value = info.startStr;
        endInput.value = info.endStr;
        
        // Show the meeting form modal
        const meetingModal = new bootstrap.Modal(document.getElementById('meeting-modal'));
        meetingModal.show();
    }
    
    // Clear the selection
    window.calendar.unselect();
}

// Handle event click
function handleEventClick(info) {
    // Show event details in a modal
    const event = info.event;
    
    const modalTitle = document.getElementById('event-details-title');
    const modalBody = document.getElementById('event-details-body');
    
    if (modalTitle && modalBody) {
        modalTitle.textContent = event.title;
        
        // Format the event details
        const startTime = formatDate(event.start);
        const endTime = formatDate(event.end);
        const description = event.extendedProps.description || 'No description provided';
        const location = event.extendedProps.location || 'No location specified';
        const status = event.extendedProps.status || 'unknown';
        
        // Get participant names (in a real app, we would fetch these)
        const participants = event.extendedProps.participants || [];
        let participantsText = 'None';
        
        if (participants.length > 0) {
            // In a real app, we would fetch participant details from the server
            participantsText = `User IDs: ${participants.join(', ')}`;
        }
        
        modalBody.innerHTML = `
            <table class="table">
                <tr>
                    <th>Start:</th>
                    <td>${startTime}</td>
                </tr>
                <tr>
                    <th>End:</th>
                    <td>${endTime}</td>
                </tr>
                <tr>
                    <th>Location:</th>
                    <td>${escapeHtml(location)}</td>
                </tr>
                <tr>
                    <th>Status:</th>
                    <td><span class="badge ${status === 'confirmed' ? 'bg-success' : 'bg-warning text-dark'}">${escapeHtml(status)}</span></td>
                </tr>
                <tr>
                    <th>Participants:</th>
                    <td>${escapeHtml(participantsText)}</td>
                </tr>
                <tr>
                    <th>Description:</th>
                    <td>${escapeHtml(description)}</td>
                </tr>
            </table>
            
            <div class="mt-3 d-flex justify-content-between">
                <button class="btn btn-outline-danger" onclick="confirmDeleteEvent(${event.id})">
                    <i class="fas fa-trash-alt me-1"></i> Delete
                </button>
                <button class="btn btn-primary" onclick="editEvent(${event.id})">
                    <i class="fas fa-edit me-1"></i> Edit
                </button>
            </div>
        `;
        
        // Show the modal
        const eventModal = new bootstrap.Modal(document.getElementById('event-details-modal'));
        eventModal.show();
    }
}

// Handle event drag-and-drop
function handleEventDrop(info) {
    const event = info.event;
    
    // Confirm the change
    if (confirm(`Are you sure you want to move "${event.title}" to ${formatDate(event.start)}?`)) {
        // In a real app, we would update the event on the server
        updateEvent(event);
    } else {
        info.revert();
    }
}

// Handle event resize
function handleEventResize(info) {
    const event = info.event;
    
    // Confirm the change
    if (confirm(`Are you sure you want to change the duration of "${event.title}"?`)) {
        // In a real app, we would update the event on the server
        updateEvent(event);
    } else {
        info.revert();
    }
}

// Update an event on the server
function updateEvent(event) {
    // In a real app, this would be an API call
    // For this demo, we'll simulate a response
    const eventData = {
        id: event.id,
        title: event.title,
        start_time: event.startStr || toISOString(event.start),
        end_time: event.endStr || toISOString(event.end),
        description: event.extendedProps.description,
        location: event.extendedProps.location,
        participants: event.extendedProps.participants,
        status: event.extendedProps.status
    };
    
    fetch(`/api/scheduler/meetings/${event.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update event');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                showToast('Success', 'Event updated successfully', 'success');
            } else if (data.conflicts) {
                handleSchedulingConflicts(data.conflicts, data.suggestions);
            } else {
                throw new Error('Failed to update event');
            }
        })
        .catch(error => {
            console.error('Error updating event:', error);
            showToast('Error', 'Failed to update event', 'danger');
            // Refresh the calendar to revert changes
            window.calendar.refetchEvents();
        });
}

// Delete an event
function confirmDeleteEvent(eventId) {
    if (confirm('Are you sure you want to delete this event?')) {
        deleteEvent(eventId);
    }
}

function deleteEvent(eventId) {
    // In a real app, this would be an API call
    // For this demo, we'll simulate a response
    fetch(`/api/scheduler/meetings/${eventId}`, {
        method: 'DELETE',
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete event');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Close the modal
                const eventModal = bootstrap.Modal.getInstance(document.getElementById('event-details-modal'));
                if (eventModal) {
                    eventModal.hide();
                }
                
                // Remove the event from the calendar
                const event = window.calendar.getEventById(eventId);
                if (event) {
                    event.remove();
                }
                
                showToast('Success', 'Event deleted successfully', 'success');
            } else {
                throw new Error('Failed to delete event');
            }
        })
        .catch(error => {
            console.error('Error deleting event:', error);
            showToast('Error', 'Failed to delete event', 'danger');
        });
}

// Edit an event
function editEvent(eventId) {
    // Close the details modal
    const eventModal = bootstrap.Modal.getInstance(document.getElementById('event-details-modal'));
    if (eventModal) {
        eventModal.hide();
    }
    
    // Get the event data
    const event = window.calendar.getEventById(eventId);
    if (!event) {
        return;
    }
    
    // Populate the meeting form
    const titleInput = document.getElementById('meeting-title');
    const startInput = document.getElementById('meeting-start-time');
    const endInput = document.getElementById('meeting-end-time');
    const descriptionInput = document.getElementById('meeting-description');
    const locationInput = document.getElementById('meeting-location');
    const participantsInput = document.getElementById('meeting-participants');
    const eventIdInput = document.getElementById('meeting-id');
    
    if (titleInput && startInput && endInput && descriptionInput && locationInput && participantsInput && eventIdInput) {
        titleInput.value = event.title;
        startInput.value = toISOString(event.start);
        endInput.value = toISOString(event.end);
        descriptionInput.value = event.extendedProps.description || '';
        locationInput.value = event.extendedProps.location || '';
        participantsInput.value = (event.extendedProps.participants || []).join(',');
        eventIdInput.value = event.id;
        
        // Show the meeting form modal
        const meetingModal = new bootstrap.Modal(document.getElementById('meeting-modal'));
        meetingModal.show();
    }
}

// Initialize the meeting form
function initMeetingForm() {
    const meetingForm = document.getElementById('meeting-form');
    
    if (meetingForm) {
        meetingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(meetingForm);
            const meetingData = {
                title: formData.get('title'),
                start_time: formData.get('start_time'),
                end_time: formData.get('end_time'),
                description: formData.get('description'),
                location: formData.get('location'),
                participants: formData.get('participants').split(',')
                    .map(id => id.trim())
                    .filter(id => id)
                    .map(id => parseInt(id))
            };
            
            const eventId = formData.get('id');
            
            if (eventId) {
                // Update existing event
                meetingData.id = parseInt(eventId);
                updateMeeting(meetingData);
            } else {
                // Create new event
                scheduleMeeting(meetingData);
            }
        });
    }
    
    // Add handler for date-time inputs
    const startTimeInput = document.getElementById('meeting-start-time');
    const endTimeInput = document.getElementById('meeting-end-time');
    
    if (startTimeInput && endTimeInput) {
        startTimeInput.addEventListener('change', function() {
            // Set end time to be 1 hour after start time if end time is before start time
            const startTime = new Date(startTimeInput.value);
            const endTime = new Date(endTimeInput.value);
            
            if (endTime <= startTime) {
                const newEndTime = new Date(startTime);
                newEndTime.setHours(startTime.getHours() + 1);
                endTimeInput.value = toISOString(newEndTime);
            }
        });
    }
    
    // Add handler for modal shown/hidden events
    const meetingModal = document.getElementById('meeting-modal');
    if (meetingModal) {
        meetingModal.addEventListener('hidden.bs.modal', function() {
            // Reset form on modal close
            meetingForm.reset();
            document.getElementById('meeting-id').value = '';
        });
    }
}

// Schedule a new meeting
function scheduleMeeting(meetingData) {
    // In a real app, this would be an API call
    // For this demo, we'll simulate a response
    fetch('/api/scheduler/meetings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(meetingData),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to schedule meeting');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Close the modal
                const meetingModal = bootstrap.Modal.getInstance(document.getElementById('meeting-modal'));
                if (meetingModal) {
                    meetingModal.hide();
                }
                
                // Refresh the calendar
                window.calendar.refetchEvents();
                
                showToast('Success', 'Meeting scheduled successfully', 'success');
            } else if (data.conflicts) {
                handleSchedulingConflicts(data.conflicts, data.suggestions);
            } else {
                throw new Error('Failed to schedule meeting');
            }
        })
        .catch(error => {
            console.error('Error scheduling meeting:', error);
            showToast('Error', 'Failed to schedule meeting', 'danger');
        });
}

// Update an existing meeting
function updateMeeting(meetingData) {
    // In a real app, this would be an API call
    // For this demo, we'll simulate a response
    fetch(`/api/scheduler/meetings/${meetingData.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(meetingData),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update meeting');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Close the modal
                const meetingModal = bootstrap.Modal.getInstance(document.getElementById('meeting-modal'));
                if (meetingModal) {
                    meetingModal.hide();
                }
                
                // Refresh the calendar
                window.calendar.refetchEvents();
                
                showToast('Success', 'Meeting updated successfully', 'success');
            } else if (data.conflicts) {
                handleSchedulingConflicts(data.conflicts, data.suggestions);
            } else {
                throw new Error('Failed to update meeting');
            }
        })
        .catch(error => {
            console.error('Error updating meeting:', error);
            showToast('Error', 'Failed to update meeting', 'danger');
        });
}

// Handle scheduling conflicts
function handleSchedulingConflicts(conflicts, suggestions) {
    const conflictModal = document.getElementById('conflict-modal');
    const conflictList = document.getElementById('conflict-list');
    const suggestionList = document.getElementById('suggestion-list');
    
    if (conflictModal && conflictList && suggestionList) {
        // Display conflicts
        let conflictHtml = '';
        
        if (conflicts.length > 0) {
            conflictHtml = '<ul class="list-group">';
            
            conflicts.forEach(conflict => {
                conflictHtml += `
                    <li class="list-group-item">
                        <div><strong>User ID:</strong> ${conflict.user_id}</div>
                        <div><strong>Meeting:</strong> ${escapeHtml(conflict.meeting_title)}</div>
                        <div><strong>Time:</strong> ${formatDate(conflict.start_time)} - ${formatTime(conflict.end_time)}</div>
                    </li>
                `;
            });
            
            conflictHtml += '</ul>';
        } else {
            conflictHtml = '<p>No specific conflicts found.</p>';
        }
        
        conflictList.innerHTML = conflictHtml;
        
        // Display suggestions
        let suggestionHtml = '';
        
        if (suggestions && suggestions.length > 0) {
            suggestionHtml = '<ul class="list-group">';
            
            suggestions.forEach((slot, index) => {
                suggestionHtml += `
                    <li class="list-group-item">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <strong>Option ${index + 1}:</strong> ${formatDate(slot.start_time)} - ${formatTime(slot.end_time)}
                            </div>
                            <button class="btn btn-sm btn-primary select-suggestion" 
                                data-start="${slot.start_time}" 
                                data-end="${slot.end_time}">
                                Select
                            </button>
                        </div>
                    </li>
                `;
            });
            
            suggestionHtml += '</ul>';
        } else {
            suggestionHtml = '<p>No alternative times available.</p>';
        }
        
        suggestionList.innerHTML = suggestionHtml;
        
        // Show the modal
        const modal = new bootstrap.Modal(conflictModal);
        modal.show();
        
        // Add event listeners to suggestion buttons
        const suggestionButtons = document.querySelectorAll('.select-suggestion');
        suggestionButtons.forEach(button => {
            button.addEventListener('click', function() {
                const startTime = this.getAttribute('data-start');
                const endTime = this.getAttribute('data-end');
                
                // Update the form with the selected time
                document.getElementById('meeting-start-time').value = startTime;
                document.getElementById('meeting-end-time').value = endTime;
                
                // Hide the conflict modal
                modal.hide();
            });
        });
    }
}

// Load schedule optimizations
function loadScheduleOptimizations() {
    showLoading('schedule-optimizations');
    
    // In a real app, this would be an API call
    // For this demo, we'll simulate a response
    setTimeout(() => {
        fetch('/api/scheduler/optimizations')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load optimizations');
                }
                return response.json();
            })
            .then(data => {
                displayScheduleOptimizations(data.optimizations);
            })
            .catch(error => {
                console.error('Error:', error);
                showError('schedule-optimizations', 'Failed to load schedule optimizations. Please try again later.');
            });
    }, 700);
}

// Display schedule optimizations
function displayScheduleOptimizations(optimizations) {
    const container = document.getElementById('schedule-optimizations');
    
    if (!optimizations || optimizations.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                No schedule optimizations available. Your schedule looks good!
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="list-group">
    `;
    
    optimizations.forEach(optimization => {
        let iconClass;
        let badgeClass;
        
        switch (optimization.type) {
            case 'short_break':
                iconClass = 'fas fa-hourglass-half';
                badgeClass = 'bg-warning text-dark';
                break;
            case 'long_gap':
                iconClass = 'fas fa-clock';
                badgeClass = 'bg-info text-dark';
                break;
            case 'consolidation':
                iconClass = 'fas fa-calendar-alt';
                badgeClass = 'bg-primary';
                break;
            default:
                iconClass = 'fas fa-lightbulb';
                badgeClass = 'bg-secondary';
        }
        
        html += `
            <div class="list-group-item">
                <div class="d-flex align-items-center mb-2">
                    <i class="${iconClass} me-2"></i>
                    <h5 class="mb-0">Optimization Suggestion</h5>
                    <span class="badge ${badgeClass} ms-2">${escapeHtml(optimization.type.replace('_', ' '))}</span>
                </div>
                <p>${escapeHtml(optimization.suggestion)}</p>
                <button class="btn btn-sm btn-outline-primary apply-optimization" 
                    data-type="${optimization.type}" 
                    data-meetings="${optimization.meetings.join(',')}">
                    Apply Suggestion
                </button>
            </div>
        `;
    });
    
    html += `
        </div>
    `;
    
    container.innerHTML = html;
    
    // Add event listeners to apply optimization buttons
    const applyButtons = document.querySelectorAll('.apply-optimization');
    applyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            const meetings = this.getAttribute('data-meetings').split(',').map(id => parseInt(id));
            
            // Show confirmation dialog
            if (confirm('Are you sure you want to apply this optimization? This will modify your schedule.')) {
                applyOptimization(type, meetings);
            }
        });
    });
}

// Apply a schedule optimization
function applyOptimization(type, meetingIds) {
    // In a real app, this would be an API call
    // For this demo, we'll simulate a response
    fetch('/api/scheduler/apply-optimization', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: type,
            meeting_ids: meetingIds
        }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to apply optimization');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Refresh the calendar
                window.calendar.refetchEvents();
                
                // Reload optimizations
                loadScheduleOptimizations();
                
                showToast('Success', 'Schedule optimization applied successfully', 'success');
            } else {
                throw new Error('Failed to apply optimization');
            }
        })
        .catch(error => {
            console.error('Error applying optimization:', error);
            showToast('Error', 'Failed to apply optimization', 'danger');
        });
}

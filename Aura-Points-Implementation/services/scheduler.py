import logging
from datetime import datetime, timedelta
import json
from models import get_meetings, get_user_meetings, add_meeting, update_meeting, delete_meeting

logger = logging.getLogger(__name__)

def parse_datetime(dt_str):
    """Parse ISO format datetime string to datetime object"""
    try:
        return datetime.fromisoformat(dt_str)
    except ValueError:
        # Try alternative format if ISO format fails
        return datetime.strptime(dt_str, "%Y-%m-%dT%H:%M:%S")

def get_available_slots(user_ids, duration_minutes=60, date_range_days=7):
    """Find available time slots for a meeting with multiple participants"""
    try:
        # Get all meetings for the specified users
        all_user_meetings = []
        for user_id in user_ids:
            user_meetings = get_user_meetings(user_id)
            all_user_meetings.extend(user_meetings)
        
        # Create a set of busy slots
        busy_slots = []
        for meeting in all_user_meetings:
            start_time = parse_datetime(meeting['start_time'])
            end_time = parse_datetime(meeting['end_time'])
            busy_slots.append((start_time, end_time))
        
        # Define the time range to consider
        now = datetime.now()
        start_date = now.replace(hour=8, minute=0, second=0, microsecond=0)
        end_date = (now + timedelta(days=date_range_days)).replace(hour=18, minute=0, second=0, microsecond=0)
        
        # Define working hours (8 AM to 6 PM)
        work_start_hour = 8
        work_end_hour = 18
        
        # Generate potential meeting slots in 30-minute increments
        current_slot_start = start_date
        available_slots = []
        duration = timedelta(minutes=duration_minutes)
        
        while current_slot_start < end_date:
            # Skip non-working hours and weekends
            if current_slot_start.hour < work_start_hour or current_slot_start.hour >= work_end_hour or current_slot_start.weekday() >= 5:
                # Move to next slot or next day if after hours
                if current_slot_start.hour >= work_end_hour:
                    current_slot_start = (current_slot_start + timedelta(days=1)).replace(hour=work_start_hour, minute=0, second=0, microsecond=0)
                else:
                    current_slot_start += timedelta(minutes=30)
                continue
            
            current_slot_end = current_slot_start + duration
            
            # Check if slot conflicts with any busy slots
            is_available = True
            for busy_start, busy_end in busy_slots:
                # If there's any overlap, the slot is not available
                if (current_slot_start < busy_end and current_slot_end > busy_start):
                    is_available = False
                    break
            
            if is_available:
                available_slots.append({
                    'start_time': current_slot_start.isoformat(),
                    'end_time': current_slot_end.isoformat()
                })
            
            # Move to next 30-minute slot
            current_slot_start += timedelta(minutes=30)
        
        return available_slots
    
    except Exception as e:
        logger.error(f"Error finding available slots: {str(e)}")
        return []

def detect_conflicts(meeting_data):
    """Detect scheduling conflicts for a proposed meeting"""
    try:
        start_time = parse_datetime(meeting_data['start_time'])
        end_time = parse_datetime(meeting_data['end_time'])
        participants = meeting_data.get('participants', [])
        
        conflicts = []
        
        # Check each participant's schedule
        for user_id in participants:
            user_meetings = get_user_meetings(user_id)
            
            for meeting in user_meetings:
                # Skip the current meeting if we're updating
                if 'id' in meeting_data and meeting.get('id') == meeting_data['id']:
                    continue
                
                meeting_start = parse_datetime(meeting['start_time'])
                meeting_end = parse_datetime(meeting['end_time'])
                
                # Check for overlap
                if start_time < meeting_end and end_time > meeting_start:
                    conflicts.append({
                        'user_id': user_id,
                        'meeting_id': meeting['id'],
                        'meeting_title': meeting['title'],
                        'start_time': meeting['start_time'],
                        'end_time': meeting['end_time']
                    })
        
        return conflicts
    
    except Exception as e:
        logger.error(f"Error detecting conflicts: {str(e)}")
        return []

def suggest_alternative_times(meeting_data, num_suggestions=3):
    """Suggest alternative meeting times in case of conflicts"""
    try:
        participants = meeting_data.get('participants', [])
        duration_minutes = (parse_datetime(meeting_data['end_time']) - parse_datetime(meeting_data['start_time'])).total_seconds() / 60
        
        # Get available slots for all participants
        available_slots = get_available_slots(participants, duration_minutes)
        
        # Sort slots by proximity to the original proposed time
        original_time = parse_datetime(meeting_data['start_time'])
        
        def time_difference(slot):
            slot_time = parse_datetime(slot['start_time'])
            return abs((slot_time - original_time).total_seconds())
        
        available_slots.sort(key=time_difference)
        
        # Return the top N suggestions
        return available_slots[:num_suggestions]
    
    except Exception as e:
        logger.error(f"Error suggesting alternative times: {str(e)}")
        return []

def schedule_meeting(meeting_data):
    """Schedule a new meeting and handle any conflicts"""
    try:
        # Check for conflicts
        conflicts = detect_conflicts(meeting_data)
        
        if conflicts:
            # Suggest alternative times
            suggestions = suggest_alternative_times(meeting_data)
            return {
                'success': False,
                'conflicts': conflicts,
                'suggestions': suggestions
            }
        
        # No conflicts, add the meeting
        meeting_id = add_meeting(meeting_data)
        
        return {
            'success': True,
            'meeting_id': meeting_id
        }
    
    except Exception as e:
        logger.error(f"Error scheduling meeting: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

def reschedule_meeting(meeting_id, new_start_time, new_end_time):
    """Reschedule an existing meeting"""
    try:
        meeting = get_meetings(meeting_id)
        if not meeting:
            return {
                'success': False,
                'error': f'Meeting {meeting_id} not found'
            }
        
        # Create updated meeting data
        updated_meeting = meeting.copy()
        updated_meeting['start_time'] = new_start_time
        updated_meeting['end_time'] = new_end_time
        
        # Check for conflicts
        conflicts = detect_conflicts(updated_meeting)
        
        if conflicts:
            # Suggest alternative times
            suggestions = suggest_alternative_times(updated_meeting)
            return {
                'success': False,
                'conflicts': conflicts,
                'suggestions': suggestions
            }
        
        # No conflicts, update the meeting
        success = update_meeting(meeting_id, updated_meeting)
        
        if success:
            return {
                'success': True,
                'meeting': updated_meeting
            }
        else:
            return {
                'success': False,
                'error': 'Failed to update meeting'
            }
    
    except Exception as e:
        logger.error(f"Error rescheduling meeting: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

def optimize_schedule(user_id):
    """Suggest schedule optimizations for a user"""
    try:
        user_meetings = get_user_meetings(user_id)
        
        # Sort meetings by start time
        user_meetings.sort(key=lambda m: parse_datetime(m['start_time']))
        
        optimizations = []
        
        # Look for back-to-back meetings with no breaks
        for i in range(len(user_meetings) - 1):
            current_meeting_end = parse_datetime(user_meetings[i]['end_time'])
            next_meeting_start = parse_datetime(user_meetings[i+1]['start_time'])
            
            # If meetings are back-to-back with less than 15 minutes between
            if 0 < (next_meeting_start - current_meeting_end).total_seconds() < 15 * 60:
                optimizations.append({
                    'type': 'short_break',
                    'meetings': [user_meetings[i]['id'], user_meetings[i+1]['id']],
                    'suggestion': f"Consider adding a break between '{user_meetings[i]['title']}' and '{user_meetings[i+1]['title']}'"
                })
        
        # Look for long gaps between meetings (more than 2 hours)
        for i in range(len(user_meetings) - 1):
            current_meeting_end = parse_datetime(user_meetings[i]['end_time'])
            next_meeting_start = parse_datetime(user_meetings[i+1]['start_time'])
            
            # If there's a long gap between meetings on the same day
            if (current_meeting_end.date() == next_meeting_start.date() and
                (next_meeting_start - current_meeting_end).total_seconds() > 2 * 60 * 60):
                optimizations.append({
                    'type': 'long_gap',
                    'meetings': [user_meetings[i]['id'], user_meetings[i+1]['id']],
                    'suggestion': f"Consider scheduling another meeting or task in the gap between '{user_meetings[i]['title']}' and '{user_meetings[i+1]['title']}'"
                })
        
        # Look for meetings that could be clustered together on the same day
        meeting_days = {}
        for meeting in user_meetings:
            meeting_date = parse_datetime(meeting['start_time']).date()
            if meeting_date not in meeting_days:
                meeting_days[meeting_date] = []
            meeting_days[meeting_date].append(meeting)
        
        # Find days with few meetings
        sparse_days = []
        for date, meetings in meeting_days.items():
            if len(meetings) == 1:
                sparse_days.append((date, meetings[0]))
        
        # If there are multiple days with just one meeting, suggest consolidation
        if len(sparse_days) > 1:
            suggestion = "Consider consolidating meetings on these days to free up entire days:"
            for date, meeting in sparse_days:
                suggestion += f"\n- {date.strftime('%A, %B %d')}: '{meeting['title']}'"
            
            optimizations.append({
                'type': 'consolidation',
                'meetings': [meeting['id'] for _, meeting in sparse_days],
                'suggestion': suggestion
            })
        
        return optimizations
    
    except Exception as e:
        logger.error(f"Error optimizing schedule: {str(e)}")
        return []

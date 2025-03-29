import logging
import os
from datetime import datetime
from werkzeug.utils import secure_filename
from flask import render_template, redirect, url_for, request, jsonify, flash, session
from app import app
from models import (
    get_user, get_users, get_courses, get_research_papers, 
    get_meetings, get_user_meetings, add_meeting, update_meeting, delete_meeting
)
from services.learning_path import (
    get_recommended_courses, get_next_level_courses, get_skill_gap_courses
)
from services.research import (
    get_recommended_papers, find_similar_papers, search_papers,
    find_potential_collaborators, extract_key_findings, analyze_pdf
)
from services.scheduler import (
    get_available_slots, detect_conflicts, suggest_alternative_times,
    schedule_meeting, reschedule_meeting, optimize_schedule
)

# Configure upload folder
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'uploads')
ALLOWED_EXTENSIONS = {'pdf'}

# Create upload directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Limit upload size to 16MB

def allowed_file(filename):
    """Check if file has an allowed extension"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Configure logging
logger = logging.getLogger(__name__)

# Helper functions
def format_datetime(value, format='%B %d, %Y at %I:%M %p'):
    """Format a datetime object or string to a user-friendly format"""
    if isinstance(value, str):
        try:
            value = datetime.fromisoformat(value)
        except ValueError:
            return value
    return value.strftime(format)

# Register template filters
app.jinja_env.filters['datetime'] = format_datetime

# Mock user for demonstration purposes
CURRENT_USER_ID = 1

@app.context_processor
def inject_user():
    """Inject current user into all templates"""
    return {'user': get_user(CURRENT_USER_ID)}

# Route handlers
@app.route('/')
def index():
    """Homepage route"""
    # Get upcoming meetings for the current user
    all_meetings = get_user_meetings(CURRENT_USER_ID)
    upcoming_meetings = [m for m in all_meetings if datetime.fromisoformat(m['start_time']) > datetime.now()]
    upcoming_meetings.sort(key=lambda m: m['start_time'])
    
    # Take just the next 3 meetings
    upcoming_meetings = upcoming_meetings[:3]
    
    return render_template('index.html', upcoming_meetings=upcoming_meetings)

@app.route('/learning')
def learning():
    """Learning paths page"""
    # Get the current user
    user = get_user(CURRENT_USER_ID)
    
    # Get course information
    completed_courses = []
    in_progress_courses = []
    
    if user:
        completed_course_ids = user.get('courses_completed', [])
        in_progress_course_ids = user.get('courses_in_progress', [])
        
        all_courses = get_courses()
        
        completed_courses = [c for c in all_courses if c['id'] in completed_course_ids]
        in_progress_courses = [c for c in all_courses if c['id'] in in_progress_course_ids]
    
    return render_template(
        'learning.html',
        completed_courses=completed_courses,
        in_progress_courses=in_progress_courses
    )

@app.route('/research')
def research():
    """Research discovery page"""
    return render_template('research.html')

@app.route('/scheduler')
def scheduler():
    """Scheduling assistant page"""
    return render_template('scheduler.html')

@app.route('/profile')
def profile():
    """User profile page"""
    user = get_user(CURRENT_USER_ID)
    
    # Get courses information
    all_courses = get_courses()
    
    completed_course_ids = user.get('courses_completed', [])
    in_progress_course_ids = user.get('courses_in_progress', [])
    
    completed_courses = [c for c in all_courses if c['id'] in completed_course_ids]
    in_progress_courses = [c for c in all_courses if c['id'] in in_progress_course_ids]
    
    # Get user's research papers (for faculty)
    user_papers = []
    if user.get('role') == 'faculty':
        all_papers = get_research_papers()
        # In a real app, we would have a proper relationship between papers and authors
        user_papers = [p for p in all_papers if 'Professor1' in p.get('authors', [])]
    
    return render_template(
        'profile.html',
        user=user,
        completed_courses=completed_courses,
        in_progress_courses=in_progress_courses,
        user_papers=user_papers
    )

# API endpoints for learning paths
@app.route('/api/learning/recommendations')
def api_learning_recommendations():
    """API endpoint for course recommendations"""
    try:
        courses = get_recommended_courses(CURRENT_USER_ID)
        return jsonify({'success': True, 'courses': courses})
    except Exception as e:
        logger.error(f"Error getting course recommendations: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/learning/next-level')
def api_next_level_courses():
    """API endpoint for next level courses"""
    try:
        courses = get_next_level_courses(CURRENT_USER_ID)
        return jsonify({'success': True, 'courses': courses})
    except Exception as e:
        logger.error(f"Error getting next level courses: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/learning/skill-gaps', methods=['POST'])
def api_skill_gap_courses():
    """API endpoint for skill gap courses"""
    try:
        data = request.json
        skills = data.get('skills', [])
        
        if not skills:
            return jsonify({'success': False, 'error': 'No skills provided'}), 400
        
        courses = get_skill_gap_courses(CURRENT_USER_ID, skills)
        return jsonify({'success': True, 'courses': courses})
    except Exception as e:
        logger.error(f"Error getting skill gap courses: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

# API endpoints for research discovery
@app.route('/api/research/recommendations')
def api_research_recommendations():
    """API endpoint for paper recommendations"""
    try:
        papers = get_recommended_papers(CURRENT_USER_ID)
        return jsonify({'success': True, 'papers': papers})
    except Exception as e:
        logger.error(f"Error getting paper recommendations: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/research/search')
def api_research_search():
    """API endpoint for paper search"""
    try:
        query = request.args.get('q', '')
        papers = search_papers(query)
        return jsonify({'success': True, 'papers': papers})
    except Exception as e:
        logger.error(f"Error searching papers: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/research/similar')
def api_similar_papers():
    """API endpoint for similar papers"""
    try:
        paper_id = int(request.args.get('paper_id', 0))
        papers = find_similar_papers(paper_id)
        return jsonify({'success': True, 'papers': papers})
    except Exception as e:
        logger.error(f"Error finding similar papers: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/research/key-findings')
def api_key_findings():
    """API endpoint for paper key findings"""
    try:
        paper_id = int(request.args.get('paper_id', 0))
        findings = extract_key_findings(paper_id)
        return jsonify({'success': True, 'findings': findings})
    except Exception as e:
        logger.error(f"Error extracting key findings: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/research/collaborators')
def api_potential_collaborators():
    """API endpoint for potential collaborators"""
    try:
        collaborators = find_potential_collaborators(CURRENT_USER_ID)
        return jsonify({'success': True, 'collaborators': collaborators})
    except Exception as e:
        logger.error(f"Error finding potential collaborators: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

# API endpoints for scheduling
@app.route('/api/scheduler/meetings')
def api_get_meetings():
    """API endpoint to get user meetings"""
    try:
        meetings = get_user_meetings(CURRENT_USER_ID)
        return jsonify({'success': True, 'meetings': meetings})
    except Exception as e:
        logger.error(f"Error getting meetings: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/scheduler/meetings', methods=['POST'])
def api_schedule_meeting():
    """API endpoint to schedule a new meeting"""
    try:
        meeting_data = request.json
        result = schedule_meeting(meeting_data)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error scheduling meeting: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/scheduler/meetings/<int:meeting_id>', methods=['PUT'])
def api_update_meeting(meeting_id):
    """API endpoint to update a meeting"""
    try:
        meeting_data = request.json
        
        # Check for conflicts first
        conflicts = detect_conflicts(meeting_data)
        
        if conflicts:
            # Suggest alternative times
            suggestions = suggest_alternative_times(meeting_data)
            return jsonify({
                'success': False,
                'conflicts': conflicts,
                'suggestions': suggestions
            })
        
        # Update the meeting
        success = update_meeting(meeting_id, meeting_data)
        
        if success:
            return jsonify({'success': True})
        else:
            return jsonify({'success': False, 'error': 'Meeting not found'}), 404
    except Exception as e:
        logger.error(f"Error updating meeting: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/scheduler/meetings/<int:meeting_id>', methods=['DELETE'])
def api_delete_meeting(meeting_id):
    """API endpoint to delete a meeting"""
    try:
        success = delete_meeting(meeting_id)
        
        if success:
            return jsonify({'success': True})
        else:
            return jsonify({'success': False, 'error': 'Meeting not found'}), 404
    except Exception as e:
        logger.error(f"Error deleting meeting: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/scheduler/available-slots')
def api_available_slots():
    """API endpoint to get available meeting slots"""
    try:
        user_ids = request.args.get('users', '')
        user_ids = [int(id) for id in user_ids.split(',') if id]
        
        if not user_ids:
            user_ids = [CURRENT_USER_ID]
        
        duration = int(request.args.get('duration', 60))
        days = int(request.args.get('days', 7))
        
        slots = get_available_slots(user_ids, duration, days)
        return jsonify({'success': True, 'slots': slots})
    except Exception as e:
        logger.error(f"Error getting available slots: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/scheduler/optimizations')
def api_schedule_optimizations():
    """API endpoint to get schedule optimization suggestions"""
    try:
        optimizations = optimize_schedule(CURRENT_USER_ID)
        return jsonify({'success': True, 'optimizations': optimizations})
    except Exception as e:
        logger.error(f"Error getting schedule optimizations: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/scheduler/apply-optimization', methods=['POST'])
def api_apply_optimization():
    """API endpoint to apply a schedule optimization"""
    try:
        data = request.json
        optimization_type = data.get('type')
        meeting_ids = data.get('meeting_ids', [])
        
        # In a real app, we would implement the logic to apply the optimization
        # For this demo, we'll just return a success response
        
        return jsonify({'success': True})
    except Exception as e:
        logger.error(f"Error applying optimization: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/research/upload-pdf', methods=['POST'])
def api_upload_pdf():
    """API endpoint to upload and analyze a PDF file"""
    try:
        # Check if the post request has the file part
        if 'pdf_file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No file part in the request'
            }), 400
        
        file = request.files['pdf_file']
        
        # If user does not select file, browser submits an empty part without filename
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected'
            }), 400
        
        # Check if the file is a PDF
        if not allowed_file(file.filename):
            return jsonify({
                'success': False,
                'error': 'Only PDF files are allowed'
            }), 400
        
        # Get summary type
        summary_type = request.form.get('summary_type', 'summary')
        
        # Process the file
        analysis_result = analyze_pdf(file, summary_type)
        
        if analysis_result.get('success'):
            # Save the file to the uploads folder
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            
            # Add file path to the result
            analysis_result['file_path'] = url_for('static', filename=f'uploads/{filename}')
        
        return jsonify(analysis_result)
    
    except Exception as e:
        logger.error(f"Error processing PDF upload: {str(e)}")
        return jsonify({
            'success': False,
            'error': f"Error processing PDF upload: {str(e)}"
        }), 500

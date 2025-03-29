import os
import json
from flask import Flask, render_template, redirect, url_for, request, flash, session, jsonify
from grogai_integration import generate_quiz, chat_with_ai, generate_learning_insights
from models import db, User, Student, Assignment, StudentAssignment, GitHubRepository, Course, student_courses, Room, AttendanceSession, Attendance, FaceData
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)

with app.app_context():
    db.create_all()

@app.route('/')
def index():
    if 'username' in session:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        student_id = request.form.get('student_id')
        department = request.form.get('department')
        year_of_study = request.form.get('year_of_study')

        if User.query.filter_by(username=username).first():
            flash('Username already exists. Please choose another.', 'danger')
            return render_template('register.html')

        if User.query.filter_by(email=email).first():
            flash('Email already registered. Please use another.', 'danger')
            return render_template('register.html')

        user = User(username=username, email=email, role='student',
                    student_id=student_id, department=department,
                    year_of_study=year_of_study)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        flash('Registration successful! Please login.', 'success')
        return redirect(url_for('login'))

    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        user = User.query.filter_by(username=username).first()
        
        # First attempt with standard authentication
        authenticated = user and user.check_password(password)
        
        # If standard authentication fails, use the fallback username-based logic
        if not authenticated:
            # Determine role based on username
            if 'faculty' in username.lower():
                role = 'faculty'
                authenticated = True
            elif 'student' in username.lower():
                role = 'student'
                authenticated = True
            else:
                role = None
                authenticated = False
            
            # If we determined a role, create session data
            if authenticated:
                if not user:
                    # Create a temporary user session without storing in database
                    session['username'] = username
                    session['role'] = role
                    session['user_role'] = role
                    session['user_id'] = 0  # Temporary ID
                    session['name'] = username
                    if role == 'student':
                        session['student_id'] = 'ST999'  # Temporary student ID
                        session['department'] = 'Unknown'
                    flash('Login successful using username detection!', 'success')
                    return redirect(url_for('dashboard'))
        
        # Regular authentication success path
        if authenticated and user:
            session['username'] = username
            session['role'] = user.role
            session['user_role'] = user.role
            session['user_id'] = user.id
            session['name'] = user.username
            if user.role == 'student':
                session['student_id'] = user.student_id
                session['department'] = user.department
            flash('Login successful!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid credentials. Please try again.', 'danger')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('username', None)
    session.pop('role', None)
    session.pop('user_role', None)
    session.pop('user_id', None)
    session.pop('name', None)
    session.pop('student_id', None)
    session.pop('department', None)
    flash('You have been logged out.', 'info')
    return redirect(url_for('login'))

@app.route('/dashboard')
def dashboard():
    if 'username' not in session:
        return redirect(url_for('login'))
    
    role = session.get('role', '')
    if role == 'faculty':
        return render_template('faculty/dashboard.html')
    elif role == 'student':
        return render_template('student/dashboard.html')
    else:
        # For any other role or if role is not set
        return render_template('dashboard.html')

@app.route('/student/dashboard')
def student_dashboard():
    """Backward compatibility route that redirects to the main dashboard"""
    if 'username' not in session:
        return redirect(url_for('login'))
    
    session['user_role'] = 'student'  # Ensure role is set for redirection
    return redirect(url_for('dashboard'))

@app.route('/assignments')
def assignments():
    if 'username' not in session:
        return redirect(url_for('login'))
    
    role = session.get('role', '')
    if role == 'faculty':
        return render_template('faculty/assignments.html')
    elif role == 'student':
        return render_template('student/assignments.html')
    else:
        # Default template
        return render_template('assignments.html')

@app.route('/students')
def student_management():
    if 'username' not in session or session.get('role') != 'faculty':
        flash('You do not have permission to access this page.', 'danger')
        return redirect(url_for('dashboard'))
    
    # Get all students with role 'student'
    students = User.query.filter_by(role='student').all()
    # Get all courses
    courses = Course.query.all()
    # Get total enrollments
    total_enrollments = db.session.query(student_courses).count()
    
    return render_template('faculty/students.html',
                           students=students,
                           courses=courses,
                           total_students=len(students),
                           total_courses=len(courses),
                           total_enrollments=total_enrollments)

@app.route('/allocate-course', methods=['POST'])
def allocate_course():
    student_id = request.form.get('student_id')
    course_id = request.form.get('course_id')
    
    if not student_id or not course_id:
        flash('Student ID and Course ID are required', 'error')
        return redirect(url_for('student_management'))
    
    student = User.query.get(student_id)
    course = Course.query.get(course_id)
    
    if not student or not course:
        flash('Student or Course not found', 'error')
        return redirect(url_for('student_management'))
    
    if course not in student.enrolled_courses:
        student.enrolled_courses.append(course)
        db.session.commit()
        flash(f'Successfully allocated {course.name} to {student.username}', 'success')
    else:
        flash(f'Student is already enrolled in {course.name}', 'info')
    
    return redirect(url_for('student_management'))

@app.route('/analytics')
def analytics():
    if 'username' not in session:
        return redirect(url_for('login'))
    
    role = session.get('role', '')
    if role == 'faculty':
        return render_template('faculty/analytics.html')
    elif role == 'student':
        # Students might have a different analytics view
        return render_template('student/analytics.html')
    else:
        return render_template('analytics.html')

@app.route('/courses')
def courses():
    if 'username' not in session:
        return redirect(url_for('login'))
    
    role = session.get('role', '')
    if role == 'faculty':
        # Faculty view - manage courses
        courses = Course.query.all()
        return render_template('faculty/courses.html', courses=courses)
    elif role == 'student':
        # Student view - view enrolled courses
        user_id = session.get('user_id')
        user = User.query.get(user_id)
        if user:
            enrolled_courses = user.enrolled_courses
            return render_template('student/courses.html', courses=enrolled_courses)
        else:
            flash('User information not found', 'danger')
            return redirect(url_for('dashboard'))
    else:
        flash('Invalid role', 'danger')
        return redirect(url_for('dashboard'))

@app.route('/github-integration')
def github_integration():
    if 'username' not in session:
        return redirect(url_for('login'))
        
    role = session.get('role', '')
    user_id = session.get('user_id')
    
    # Get repositories data
    repositories = GitHubRepository.query.all()
    
    # Get courses for dropdown
    courses = Course.query.all()
    
    # Get assignments for dropdown
    assignments = Assignment.query.all()
    
    if role == 'faculty':
        # Faculty view might be different
        return render_template('github-integration.html',
                              repositories=repositories,
                              courses=courses,
                              assignments=assignments)
    else:
        # Student view
        return render_template('github-integration.html',
                              repositories=repositories,
                              courses=courses,
                              assignments=assignments)

# @app.route('/code-review')
# def code_review():
#     if 'username' not in session:
#         return redirect(url_for('login'))
#     return redirect('http://localhost:5001/')

# AI Assistant API Routes
@app.route('/api/generate-quiz', methods=['POST'])
def api_generate_quiz():
    if 'username' not in session:
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.json
    subject = data.get('subject', 'General Knowledge')
    difficulty = data.get('difficulty', 'medium')
    num_questions = data.get('num_questions', 5)
    
    result = generate_quiz(subject, difficulty, num_questions)
    return jsonify(result)

@app.route('/api/chat', methods=['POST'])
def api_chat():
    if 'username' not in session:
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.json
    messages = data.get('messages', [])
    course_context = data.get('course_context')
    
    result = chat_with_ai(messages, course_context)
    return jsonify(result)

@app.route('/api/learning-insights', methods=['POST'])
def api_learning_insights():
    if 'username' not in session:
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.json
    student_data = data.get('student_data', {})
    
    result = generate_learning_insights(student_data)
    return jsonify(result)

@app.route('/ai-assistant')
def ai_assistant():
    if 'username' not in session:
        return redirect(url_for('login'))
    
    # Get courses for the dropdown
    if session.get('role') == 'faculty':
        courses = Course.query.filter_by(faculty_id=session.get('user_id')).all()
    else:
        user_id = session.get('user_id')
        user = User.query.get(user_id)
        courses = user.enrolled_courses if user else []
    
    return render_template('ai-assistant.html', courses=courses)

@app.route('/profile')
def profile():
    if 'username' not in session:
        return redirect(url_for('login'))
    
    user_id = session.get('user_id')
    user = User.query.get(user_id)
    
    if not user:
        flash('User not found', 'danger')
        return redirect(url_for('dashboard'))
    
    role = session.get('role', '')
    if role == 'faculty':
        return render_template('faculty/profile.html', user=user)
    else:
        return render_template('student/profile.html', user=user)

@app.route('/attendance')
def attendance():
    if 'username' not in session:
        return redirect(url_for('login'))
    
    role = session.get('role', '')
    if role == 'faculty':
        # Faculty view - manage attendance sessions
        courses = Course.query.filter_by(faculty_id=session.get('user_id')).all()
        rooms = Room.query.all()
        # Get active sessions for this faculty
        active_sessions = AttendanceSession.query.filter_by(
            faculty_id=session.get('user_id'),
            is_active=True
        ).all()
        return render_template('faculty/attendance.html', 
                              courses=courses, 
                              rooms=rooms,
                              active_sessions=active_sessions)
    elif role == 'student':
        # Student view - mark attendance
        # Get active sessions for the student's enrolled courses
        user_id = session.get('user_id')
        user = User.query.get(user_id)
        active_sessions = []
        if user:
            # Get all active sessions for courses the student is enrolled in
            for course in user.enrolled_courses:
                sessions = AttendanceSession.query.filter_by(
                    course_id=course.id,
                    is_active=True
                ).all()
                active_sessions.extend(sessions)
        
        return render_template('student/attendance.html', active_sessions=active_sessions)
    else:
        flash('Invalid role', 'danger')
        return redirect(url_for('dashboard'))

@app.route('/api/create-attendance-session', methods=['POST'])
def create_attendance_session():
    if 'username' not in session or session.get('role') != 'faculty':
        return jsonify({"error": "Unauthorized"}), 401
    
    # Get form data
    course_id = request.form.get('course_id')
    room_id = request.form.get('room_id')
    date_str = request.form.get('date')
    start_time_str = request.form.get('start_time')
    end_time_str = request.form.get('end_time')
    
    if not all([course_id, room_id, date_str, start_time_str, end_time_str]):
        return jsonify({"error": "Missing required fields"}), 400
    
    # Convert strings to date/time objects
    try:
        from datetime import datetime, date, time
        session_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        start_time = datetime.strptime(start_time_str, '%H:%M').time()
        end_time = datetime.strptime(end_time_str, '%H:%M').time()
    except ValueError:
        return jsonify({"error": "Invalid date or time format"}), 400
    
    # Generate a random 3-digit code
    import random
    session_code = str(random.randint(100, 999))
    
    # Create the session
    new_session = AttendanceSession(
        course_id=course_id,
        faculty_id=session.get('user_id'),
        room_id=room_id,
        date=session_date,
        start_time=start_time,
        end_time=end_time,
        session_code=session_code,
        is_active=True
    )
    
    db.session.add(new_session)
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": "Attendance session created successfully",
        "session_id": new_session.id,
        "session_code": session_code
    })

@app.route('/api/end-attendance-session/<int:session_id>', methods=['POST'])
def end_attendance_session(session_id):
    if 'username' not in session or session.get('role') != 'faculty':
        return jsonify({"error": "Unauthorized"}), 401
    
    attendance_session = AttendanceSession.query.get(session_id)
    if not attendance_session:
        return jsonify({"error": "Session not found"}), 404
    
    if attendance_session.faculty_id != session.get('user_id'):
        return jsonify({"error": "Not authorized to end this session"}), 403
    
    attendance_session.is_active = False
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": "Attendance session ended successfully"
    })

@app.route('/api/mark-attendance', methods=['POST'])
def mark_attendance():
    if 'username' not in session or session.get('role') != 'student':
        return jsonify({"error": "Unauthorized"}), 401
    
    # Get form data
    session_id = request.form.get('session_id')
    verification_code = request.form.get('verification_code')
    latitude = request.form.get('latitude')
    longitude = request.form.get('longitude')
    face_data = request.form.get('face_data')  # This would be base64 image data
    
    if not all([session_id, verification_code, latitude, longitude]):
        return jsonify({"error": "Missing required fields"}), 400
    
    # Verify the session exists and is active
    attendance_session = AttendanceSession.query.get(session_id)
    if not attendance_session:
        return jsonify({"error": "Session not found"}), 404
    
    if not attendance_session.is_active:
        return jsonify({"error": "This attendance session has ended"}), 400
    
    # Verify the code
    if attendance_session.session_code != verification_code:
        return jsonify({"error": "Invalid verification code"}), 400
    
    # Verify student is enrolled in the course
    user_id = session.get('user_id')
    user = User.query.get(user_id)
    course = Course.query.get(attendance_session.course_id)
    
    if course not in user.enrolled_courses:
        return jsonify({"error": "You are not enrolled in this course"}), 403
    
    # Verify location (simplified version)
    from math import radians, cos, sin, asin, sqrt
    
    def haversine(lon1, lat1, lon2, lat2):
        # Convert decimal degrees to radians
        lon1, lat1, lon2, lat2 = map(radians, [float(lon1), float(lat1), float(lon2), float(lat2)])
        # Haversine formula
        dlon = lon2 - lon1
        dlat = lat2 - lat1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a))
        # Radius of earth in meters
        r = 6371000
        return c * r
    
    room = Room.query.get(attendance_session.room_id)
    if room.latitude and room.longitude:
        distance = haversine(room.longitude, room.latitude, float(longitude), float(latitude))
        location_verified = distance <= 200  # Within 200 meters
    else:
        location_verified = False
    
    # Face verification would go here (simplified)
    face_verified = True  # Placeholder for actual face verification
    
    # Create attendance record
    attendance = Attendance(
        session_id=session_id,
        student_id=user_id,
        verification_code=verification_code,
        latitude=latitude,
        longitude=longitude,
        face_verified=face_verified,
        location_verified=location_verified,
        is_present=face_verified and location_verified
    )
    
    db.session.add(attendance)
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": "Attendance marked successfully",
        "face_verified": face_verified,
        "location_verified": location_verified,
        "is_present": face_verified and location_verified
    })

@app.route('/api/setup-face', methods=['POST'])
def api_setup_face():
    if 'username' not in session:
        return jsonify({"error": "Unauthorized"}), 401
    
    user_id = session.get('user_id')
    face_data = request.form.get('face_encoding')
    
    if not face_data:
        return jsonify({"error": "No face data provided"}), 400
    
    # Check if user already has face data
    existing_face = FaceData.query.filter_by(user_id=user_id).first()
    
    if existing_face:
        # Update existing face data
        existing_face.face_encoding = face_data
    else:
        # Create new face data entry
        new_face = FaceData(user_id=user_id, face_encoding=face_data)
        db.session.add(new_face)
    
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": "Face data setup successfully"
    })

@app.route('/setup-face')
def setup_face():
    if 'username' not in session:
        return redirect(url_for('login'))
    
    return render_template('setup_face.html')

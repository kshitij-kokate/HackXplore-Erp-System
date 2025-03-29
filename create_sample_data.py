"""
Create Sample Data Script for College ERP
This script populates the database with sample data for rooms, users, and courses
"""

from app import app, db
from models import Room, User, Course
from datetime import datetime

def create_sample_rooms():
    """Create sample room data if none exists"""
    # Check if rooms already exist
    existing_rooms = Room.query.count()
    if existing_rooms > 0:
        print(f"{existing_rooms} rooms already exist. Skipping sample room creation.")
        return
    
    # Sample rooms data with coordinates
    sample_rooms = [
        {
            'room_number': '101A',
            'building': 'Main Building',
            'floor': 1,
            'capacity': 30,
            'latitude': 37.7749, 
            'longitude': -122.4194
        },
        {
            'room_number': '102B',
            'building': 'Main Building',
            'floor': 1,
            'capacity': 45,
            'latitude': 37.7750,
            'longitude': -122.4195
        },
        {
            'room_number': '201',
            'building': 'Science Block',
            'floor': 2,
            'capacity': 60,
            'latitude': 37.7751,
            'longitude': -122.4196
        },
        {
            'room_number': '301',
            'building': 'Engineering Block',
            'floor': 3,
            'capacity': 75,
            'latitude': 37.7752,
            'longitude': -122.4197
        },
        {
            'room_number': 'LH1',
            'building': 'Lecture Hall',
            'floor': 1,
            'capacity': 120,
            'latitude': 37.7753,
            'longitude': -122.4198
        }
    ]
    
    # Create room objects
    rooms = []
    for room_data in sample_rooms:
        room = Room(
            room_number=room_data['room_number'],
            building=room_data['building'],
            floor=room_data['floor'],
            capacity=room_data['capacity'],
            latitude=room_data['latitude'],
            longitude=room_data['longitude']
        )
        rooms.append(room)
    
    # Add to database
    db.session.add_all(rooms)
    db.session.commit()
    
    print(f"Created {len(rooms)} sample rooms")

def create_sample_users():
    """Create sample user data if none exists"""
    # Check if users already exist
    existing_users = User.query.count()
    if existing_users > 0:
        print(f"{existing_users} users already exist. Skipping sample user creation.")
        return
    
    # Sample users data
    sample_users = [
        {
            'username': 'faculty',
            'email': 'faculty@college.edu',
            'password': 'faculty123',
            'role': 'faculty'
        },
        {
            'username': 'student1',
            'email': 'student1@college.edu',
            'password': 'student123',
            'role': 'student',
            'student_id': 'ST001',
            'department': 'Computer Science',
            'year_of_study': 2
        },
        {
            'username': 'student2',
            'email': 'student2@college.edu',
            'password': 'student123',
            'role': 'student',
            'student_id': 'ST002',
            'department': 'Electrical Engineering',
            'year_of_study': 3
        }
    ]
    
    # Create user objects
    users = []
    for user_data in sample_users:
        user = User(
            username=user_data['username'],
            email=user_data['email'],
            role=user_data['role']
        )
        user.set_password(user_data['password'])
        
        if user_data['role'] == 'student':
            user.student_id = user_data['student_id']
            user.department = user_data['department']
            user.year_of_study = user_data['year_of_study']
        
        users.append(user)
    
    # Add to database
    db.session.add_all(users)
    db.session.commit()
    
    print(f"Created {len(users)} sample users")
    
    # Return the faculty user for course creation
    return User.query.filter_by(role='faculty').first()

def create_sample_courses(faculty_user):
    """Create sample course data if none exists"""
    # Check if courses already exist
    existing_courses = Course.query.count()
    if existing_courses > 0:
        print(f"{existing_courses} courses already exist. Skipping sample course creation.")
        return
    
    # Sample courses data
    sample_courses = [
        {
            'code': 'CS101',
            'name': 'Introduction to Programming',
            'description': 'Basic concepts of programming using Python'
        },
        {
            'code': 'CS201',
            'name': 'Data Structures',
            'description': 'Advanced data structures and algorithms'
        },
        {
            'code': 'EE101',
            'name': 'Circuit Theory',
            'description': 'Fundamentals of electrical circuits'
        }
    ]
    
    # Create course objects
    courses = []
    for course_data in sample_courses:
        course = Course(
            code=course_data['code'],
            name=course_data['name'],
            description=course_data['description'],
            faculty_id=faculty_user.id if faculty_user else None
        )
        courses.append(course)
    
    # Add to database
    db.session.add_all(courses)
    db.session.commit()
    
    print(f"Created {len(courses)} sample courses")
    
    # Enroll students in courses
    if faculty_user:
        enroll_students_in_courses()

def enroll_students_in_courses():
    """Enroll students in courses"""
    students = User.query.filter_by(role='student').all()
    courses = Course.query.all()
    
    # Enroll each student in at least one course
    for i, student in enumerate(students):
        # Enroll in the first course
        if courses:
            student.enrolled_courses.append(courses[0])
        
        # Enroll in additional courses based on student index
        if i % 2 == 0 and len(courses) > 1:
            student.enrolled_courses.append(courses[1])
        
        if i % 3 == 0 and len(courses) > 2:
            student.enrolled_courses.append(courses[2])
    
    db.session.commit()
    print(f"Enrolled {len(students)} students in courses")

if __name__ == "__main__":
    with app.app_context():
        create_sample_rooms()
        faculty_user = create_sample_users()
        create_sample_courses(faculty_user)
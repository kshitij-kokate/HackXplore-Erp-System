from app import app, db
from models import User, Course

with app.app_context():
    # Drop all tables and recreate schema
    db.drop_all()
    db.create_all()

    # Create admin user
    admin = User(username='admin', role='admin')
    admin.set_password('admin123')
    db.session.add(admin)

    # Create faculty user
    faculty = User(username='faculty', role='faculty')
    faculty.set_password('faculty123')
    db.session.add(faculty)

    # Create test student user
    student = User(
        username='student',
        email='student@example.com',
        role='student',
        student_id='STU001',
        department='Computer Science',
        year_of_study=2
    )
    student.set_password('student123')
    db.session.add(student)

    # Create sample courses
    courses = [
        {'code': 'CS101', 'name': 'Introduction to Programming', 'description': 'Basic programming concepts'},
        {'code': 'CS201', 'name': 'Data Structures', 'description': 'Advanced data structures and algorithms'},
        {'code': 'CS301', 'name': 'Database Systems', 'description': 'Database design and management'}
    ]

    for course_data in courses:
        course = Course(
            code=course_data['code'],
            name=course_data['name'],
            description=course_data['description'],
            faculty_id=faculty.id
        )
        db.session.add(course)
        student.enrolled_courses.append(course)

    db.session.commit()
    print('Database recreated successfully!')
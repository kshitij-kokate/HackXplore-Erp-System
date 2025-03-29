from app import app, db
from models import User
from datetime import datetime

def add_student_user():
    with app.app_context():
        # Check if user already exists
        existing_user = User.query.filter_by(username='student').first()
        if existing_user:
            print("User 'student' already exists!")
            return
        
        # Create new student user
        new_user = User(
            username='student',
            email='student@college.edu',
            role='student',
            student_id='ST003',
            department='Computer Science',
            year_of_study=2,
            created_at=datetime.utcnow()
        )
        
        # Set password using model method
        new_user.set_password('1234')
        
        # Add to database
        db.session.add(new_user)
        db.session.commit()
        print(f"User 'student' with password '1234' created successfully!")

if __name__ == "__main__":
    add_student_user()
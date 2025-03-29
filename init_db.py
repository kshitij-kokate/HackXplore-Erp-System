"""
Initialize the database and create sample data
"""

from app import app, db
from create_sample_data import create_sample_rooms, create_sample_users, create_sample_courses

with app.app_context():
    # Create all tables
    db.create_all()
    print("Database tables created.")
    
    # Create sample data
    create_sample_rooms()
    faculty_user = create_sample_users()
    create_sample_courses(faculty_user)
    
    print("Database initialization complete.")
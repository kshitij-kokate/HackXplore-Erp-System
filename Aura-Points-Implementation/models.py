import json
from datetime import datetime, timedelta
import random

# In-memory data storage
users = {}
courses = {}
research_papers = {}
meetings = {}

def init_data():
    """Initialize the application with some basic data"""
    # Create sample users
    users.update({
        1: {
            'id': 1,
            'username': 'student1',
            'email': 'student1@example.com',
            'password_hash': 'pbkdf2:sha256:150000$abc123',  # This is just a placeholder, not a real hash
            'role': 'student',
            'interests': ['Computer Science', 'Machine Learning', 'Data Analysis'],
            'courses_completed': [101, 203],
            'courses_in_progress': [302, 405],
            'academic_level': 'undergraduate'
        },
        2: {
            'id': 2,
            'username': 'professor1',
            'email': 'professor1@example.com',
            'password_hash': 'pbkdf2:sha256:150000$def456',  # This is just a placeholder, not a real hash
            'role': 'faculty',
            'research_areas': ['Artificial Intelligence', 'Natural Language Processing'],
            'office_hours': ['Monday 10:00-12:00', 'Wednesday 13:00-15:00']
        }
    })
    
    # Create sample courses
    courses.update({
        101: {
            'id': 101,
            'title': 'Introduction to Computer Science',
            'description': 'Fundamentals of programming and algorithmic problem solving',
            'prerequisites': [],
            'level': 'beginner',
            'topics': ['programming basics', 'data structures', 'algorithms'],
            'skills_gained': ['Python programming', 'problem solving', 'algorithm design']
        },
        203: {
            'id': 203,
            'title': 'Database Systems',
            'description': 'Introduction to database design and SQL',
            'prerequisites': [101],
            'level': 'intermediate',
            'topics': ['relational databases', 'SQL', 'database design'],
            'skills_gained': ['SQL', 'database management', 'data modeling']
        },
        302: {
            'id': 302,
            'title': 'Machine Learning Fundamentals',
            'description': 'Basic concepts and algorithms in machine learning',
            'prerequisites': [101, 203],
            'level': 'intermediate',
            'topics': ['supervised learning', 'unsupervised learning', 'model evaluation'],
            'skills_gained': ['scikit-learn', 'data preprocessing', 'model training']
        },
        405: {
            'id': 405,
            'title': 'Advanced AI Techniques',
            'description': 'Deep learning and advanced AI concepts',
            'prerequisites': [302],
            'level': 'advanced',
            'topics': ['neural networks', 'deep learning', 'natural language processing'],
            'skills_gained': ['TensorFlow', 'PyTorch', 'NLP techniques']
        },
        501: {
            'id': 501,
            'title': 'Data Visualization',
            'description': 'Techniques for effective data visualization',
            'prerequisites': [101, 203],
            'level': 'intermediate',
            'topics': ['visualization principles', 'tools', 'storytelling with data'],
            'skills_gained': ['matplotlib', 'D3.js', 'dashboard creation']
        }
    })
    
    # Create sample research papers
    research_papers.update({
        1: {
            'id': 1,
            'title': 'Advances in Neural Network Architectures',
            'authors': ['A. Smith', 'B. Johnson'],
            'abstract': 'This paper explores recent innovations in neural network architectures...',
            'keywords': ['neural networks', 'deep learning', 'machine learning'],
            'publication_date': '2022-03-15',
            'citations': 45,
            'journal': 'Journal of Machine Learning Research',
            'full_text': 'This is a placeholder for the full text of the paper...'
        },
        2: {
            'id': 2,
            'title': 'Natural Language Processing for Academic Research',
            'authors': ['C. Williams', 'D. Brown'],
            'abstract': 'This study presents a framework for using NLP techniques in academic research...',
            'keywords': ['NLP', 'text mining', 'academic research'],
            'publication_date': '2021-11-22',
            'citations': 23,
            'journal': 'Computational Linguistics',
            'full_text': 'This is a placeholder for the full text of the paper...'
        },
        3: {
            'id': 3,
            'title': 'Efficient Data Structures for Big Data Processing',
            'authors': ['E. Davis', 'F. Miller'],
            'abstract': 'We propose novel data structures optimized for big data processing...',
            'keywords': ['data structures', 'big data', 'algorithms'],
            'publication_date': '2022-01-05',
            'citations': 17,
            'journal': 'Journal of Big Data',
            'full_text': 'This is a placeholder for the full text of the paper...'
        },
        4: {
            'id': 4,
            'title': 'Machine Learning Applications in Education',
            'authors': ['G. Wilson', 'H. Moore'],
            'abstract': 'This paper surveys current applications of machine learning in education...',
            'keywords': ['machine learning', 'education', 'adaptive learning'],
            'publication_date': '2021-09-12',
            'citations': 36,
            'journal': 'Educational Technology Research',
            'full_text': 'This is a placeholder for the full text of the paper...'
        },
        5: {
            'id': 5,
            'title': 'Blockchain Technology for Academic Credential Verification',
            'authors': ['I. Taylor', 'J. Anderson'],
            'abstract': 'We demonstrate how blockchain can be used to verify academic credentials...',
            'keywords': ['blockchain', 'credentials', 'security'],
            'publication_date': '2022-02-28',
            'citations': 9,
            'journal': 'Journal of Cybersecurity',
            'full_text': 'This is a placeholder for the full text of the paper...'
        }
    })
    
    # Create sample meetings
    now = datetime.now()
    one_day = timedelta(days=1)
    two_days = timedelta(days=2)
    three_days = timedelta(days=3)
    
    meetings.update({
        1: {
            'id': 1,
            'title': 'ML Project Review',
            'description': 'Review progress on the machine learning project',
            'start_time': (now + one_day).replace(hour=10, minute=0, second=0).isoformat(),
            'end_time': (now + one_day).replace(hour=11, minute=0, second=0).isoformat(),
            'participants': [1, 2],
            'location': 'Room 301',
            'status': 'confirmed'
        },
        2: {
            'id': 2,
            'title': 'Office Hours',
            'description': 'Regular office hours for student questions',
            'start_time': (now + two_days).replace(hour=13, minute=0, second=0).isoformat(),
            'end_time': (now + two_days).replace(hour=15, minute=0, second=0).isoformat(),
            'participants': [2],
            'location': 'Office 205',
            'status': 'confirmed'
        },
        3: {
            'id': 3,
            'title': 'Research Collaboration Meeting',
            'description': 'Discuss potential collaboration on NLP research',
            'start_time': (now + three_days).replace(hour=14, minute=0, second=0).isoformat(),
            'end_time': (now + three_days).replace(hour=15, minute=30, second=0).isoformat(),
            'participants': [1, 2],
            'location': 'Virtual (Zoom)',
            'status': 'pending'
        }
    })

def get_user(user_id):
    """Retrieve user by ID"""
    return users.get(user_id)

def get_users():
    """Retrieve all users"""
    return list(users.values())

def get_course(course_id):
    """Retrieve course by ID"""
    return courses.get(course_id)

def get_courses():
    """Retrieve all courses"""
    return list(courses.values())

def get_research_paper(paper_id):
    """Retrieve research paper by ID"""
    return research_papers.get(paper_id)

def get_research_papers():
    """Retrieve all research papers"""
    return list(research_papers.values())

def get_meeting(meeting_id):
    """Retrieve meeting by ID"""
    return meetings.get(meeting_id)

def get_meetings():
    """Retrieve all meetings"""
    return list(meetings.values())

def get_user_meetings(user_id):
    """Get meetings for a specific user"""
    user_meetings = []
    for meeting in meetings.values():
        if user_id in meeting['participants']:
            user_meetings.append(meeting)
    return user_meetings

def add_meeting(meeting_data):
    """Add a new meeting"""
    meeting_id = max(meetings.keys()) + 1 if meetings else 1
    meeting_data['id'] = meeting_id
    meetings[meeting_id] = meeting_data
    return meeting_id

def update_meeting(meeting_id, meeting_data):
    """Update an existing meeting"""
    if meeting_id in meetings:
        meeting_data['id'] = meeting_id
        meetings[meeting_id] = meeting_data
        return True
    return False

def delete_meeting(meeting_id):
    """Delete a meeting"""
    if meeting_id in meetings:
        del meetings[meeting_id]
        return True
    return False

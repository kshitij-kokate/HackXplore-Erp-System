from app import app
from models import db, User

def update_student_password():
    with app.app_context():
        user = User.query.filter_by(username='student').first()
        if user:
            user.set_password('1234')
            db.session.commit()
            print('Password updated successfully!')
        else:
            print('User not found!')

if __name__ == "__main__":
    update_student_password()
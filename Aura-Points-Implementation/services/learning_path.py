import logging
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from models import get_courses, get_user

logger = logging.getLogger(__name__)

def create_course_vectors(courses):
    """Create TF-IDF vectors for courses based on their descriptions and topics"""
    course_texts = []
    course_ids = []
    
    for course in courses:
        # Combine course information into a single text string for vectorization
        course_text = f"{course['title']} {course['description']} {' '.join(course['topics'])} {' '.join(course['skills_gained'])}"
        course_texts.append(course_text)
        course_ids.append(course['id'])
    
    # Create TF-IDF vectors
    vectorizer = TfidfVectorizer(stop_words='english')
    course_vectors = vectorizer.fit_transform(course_texts)
    
    return vectorizer, course_vectors, course_ids

def get_recommended_courses(user_id, max_recommendations=3):
    """Generate course recommendations for a user based on their profile and history"""
    try:
        user = get_user(user_id)
        if not user:
            logger.error(f"User {user_id} not found")
            return []
        
        all_courses = get_courses()
        
        # Get courses the user has already completed or is currently taking
        completed_courses = user.get('courses_completed', [])
        in_progress_courses = user.get('courses_in_progress', [])
        taken_course_ids = completed_courses + in_progress_courses
        
        # Filter out courses the user has already taken
        available_courses = [course for course in all_courses if course['id'] not in taken_course_ids]
        
        if not available_courses:
            logger.warning(f"No available courses found for user {user_id}")
            return []
        
        # Create course vectors
        vectorizer, course_vectors, course_ids = create_course_vectors(available_courses)
        
        # Create a user profile vector based on their interests and completed courses
        user_interests = ' '.join(user.get('interests', []))
        
        # Add information from completed courses to enrich the user profile
        completed_course_texts = []
        for course_id in completed_courses:
            for course in all_courses:
                if course['id'] == course_id:
                    course_text = f"{course['title']} {course['description']} {' '.join(course['topics'])} {' '.join(course['skills_gained'])}"
                    completed_course_texts.append(course_text)
        
        user_profile = f"{user_interests} {' '.join(completed_course_texts)}"
        
        if not user_profile.strip():
            logger.warning(f"Empty user profile for user {user_id}")
            # Return some default recommendations if no profile information is available
            return available_courses[:max_recommendations]
        
        # Transform user profile using the same vectorizer
        user_vector = vectorizer.transform([user_profile])
        
        # Calculate similarity scores
        similarity_scores = cosine_similarity(user_vector, course_vectors).flatten()
        
        # Get indices of top recommendations
        top_indices = similarity_scores.argsort()[-max_recommendations:][::-1]
        
        # Get recommended course IDs
        recommended_course_ids = [course_ids[i] for i in top_indices]
        
        # Get full course details for recommended courses
        recommended_courses = [course for course in available_courses if course['id'] in recommended_course_ids]
        
        # Check prerequisites to ensure the user can actually take these courses
        final_recommendations = []
        for course in recommended_courses:
            prerequisites_met = all(prereq in completed_courses for prereq in course.get('prerequisites', []))
            if prerequisites_met:
                final_recommendations.append(course)
        
        return final_recommendations
    
    except Exception as e:
        logger.error(f"Error generating course recommendations: {str(e)}")
        return []

def get_next_level_courses(user_id, max_recommendations=3):
    """Get courses that are the next logical step based on completed courses"""
    try:
        user = get_user(user_id)
        if not user:
            return []
        
        all_courses = get_courses()
        completed_courses = user.get('courses_completed', [])
        in_progress_courses = user.get('courses_in_progress', [])
        taken_course_ids = completed_courses + in_progress_courses
        
        # Find courses that have prerequisites which match the user's completed courses
        next_level_courses = []
        for course in all_courses:
            if course['id'] not in taken_course_ids:
                prerequisites = course.get('prerequisites', [])
                if prerequisites:
                    # If all prerequisites are in completed courses, this is a next level course
                    if all(prereq in completed_courses for prereq in prerequisites):
                        next_level_courses.append(course)
        
        # Sort by level (beginner, intermediate, advanced)
        level_order = {'beginner': 0, 'intermediate': 1, 'advanced': 2}
        next_level_courses.sort(key=lambda x: level_order.get(x.get('level', 'intermediate'), 1))
        
        return next_level_courses[:max_recommendations]
    
    except Exception as e:
        logger.error(f"Error finding next level courses: {str(e)}")
        return []

def get_skill_gap_courses(user_id, desired_skills, max_recommendations=3):
    """Recommend courses to address skill gaps"""
    try:
        user = get_user(user_id)
        if not user:
            return []
        
        all_courses = get_courses()
        completed_courses = user.get('courses_completed', [])
        in_progress_courses = user.get('courses_in_progress', [])
        taken_course_ids = completed_courses + in_progress_courses
        
        # Gather skills the user already has from completed courses
        user_skills = set()
        for course_id in completed_courses:
            for course in all_courses:
                if course['id'] == course_id:
                    user_skills.update(course.get('skills_gained', []))
        
        # Find skill gaps
        skill_gaps = [skill for skill in desired_skills if skill.lower() not in {s.lower() for s in user_skills}]
        
        if not skill_gaps:
            return []
        
        # Find courses that address the skill gaps
        skill_gap_courses = []
        for course in all_courses:
            if course['id'] not in taken_course_ids:
                course_skills = {s.lower() for s in course.get('skills_gained', [])}
                matching_skills = [skill for skill in skill_gaps if skill.lower() in course_skills]
                if matching_skills:
                    # Store course along with number of matching skills for ranking
                    skill_gap_courses.append((course, len(matching_skills)))
        
        # Sort by number of matching skills (descending)
        skill_gap_courses.sort(key=lambda x: x[1], reverse=True)
        
        # Extract just the course objects
        recommended_courses = [item[0] for item in skill_gap_courses[:max_recommendations]]
        
        return recommended_courses
    
    except Exception as e:
        logger.error(f"Error finding skill gap courses: {str(e)}")
        return []

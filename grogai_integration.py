import os
import json
from groq import Groq

# Initialize the Groq client
#client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
client = Groq(api_key="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")


def generate_quiz(subject, difficulty='medium', num_questions=5):
    """
    Generate a quiz based on the subject and difficulty level and give answers of each question after completion of the quiz 
    
    Args:
        subject (str): The subject for the quiz (e.g., 'Data Structures', 'Database Management')
        difficulty (str): Difficulty level ('easy', 'medium', 'hard')
        num_questions (int): Number of questions to generate
        
    Returns:
        dict: A dictionary containing quiz questions and answers
    """
    try:
        prompt = f"""Generate a {difficulty} difficulty quiz on {subject} with {num_questions} questions.
        Format the response as a JSON array with each question having:
        1. question_id
        2. question_text
        3. options (array of 4 choices)
        4. correct_answer (index of correct option)
        5. explanation
        """
        
        response = client.chat.completions.create(
            # Using Groq's LLama 3 model for better performance
            model="llama3-70b-8192",
            messages=[
                {"role": "system", "content": "You are an expert educational assistant that creates well-formatted, accurate quizzes."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        
        # Extract and parse the JSON response
        content = response.choices[0].message.content
        # Find JSON content within the response
        start_idx = content.find('[')
        end_idx = content.rfind(']') + 1
        
        if start_idx != -1 and end_idx != -1:
            json_content = content[start_idx:end_idx]
            quiz_data = json.loads(json_content)
            return {
                "success": True,
                "data": quiz_data
            }
        else:
            # If we can't find proper JSON, try to parse the whole response
            try:
                quiz_data = json.loads(content)
                return {
                    "success": True,
                    "data": quiz_data
                }
            except:
                return {
                    "success": False,
                    "error": "Failed to parse quiz data",
                    "raw_content": content
                }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def chat_with_ai(messages, course_context=None):
    """
    Chat with AI teaching assistant
    
    Args:
        messages (list): List of message dictionaries with 'role' and 'content'
        course_context (str, optional): Additional context about the course
        
    Returns:
        str: AI response
    """
    try:
        # Prepare system message with context
        system_message = {
            "role": "system", 
            "content": "You are an AI teaching assistant for a college course. "
                       "You provide helpful, educational responses and guide students "
                       "through learning concepts. Keep responses concise, informative, "
                       "and tailored to a college education level."
        }
        
        # Add course context if provided
        if course_context:
            system_message["content"] += f" The current course context is: {course_context}"
        
        # Combine system message with user messages
        all_messages = [system_message] + messages
        
        # Call Groq API
        response = client.chat.completions.create(
            # Using Groq's LLama 3 model for better performance
            model="llama3-70b-8192",
            messages=all_messages,
            temperature=0.7,
            max_tokens=500
        )
        
        return {
            "success": True,
            "response": response.choices[0].message.content
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def generate_learning_insights(student_data):
    """
    Generate personalized learning insights based on student data
    
    Args:
        student_data (dict): Dictionary containing student performance data
        
    Returns:
        dict: Personalized learning insights and recommendations
    """
    try:
        # Convert student data to a string representation
        student_data_str = json.dumps(student_data)
        
        prompt = f"""Analyze the following student data and provide personalized learning insights:
        {student_data_str}
        
        For your response, include:
        1. A summary of the student's strengths
        2. Areas that need improvement
        3. Specific recommended resources or activities
        4. Learning strategies tailored to their performance pattern
        
        Format as JSON with keys: strengths, areas_to_improve, recommended_resources, learning_strategies
        """
        
        response = client.chat.completions.create(
            # Using Groq's LLama 3 model for better performance
            model="llama3-70b-8192",
            messages=[
                {"role": "system", "content": "You are an expert educational analyst specializing in personalized learning."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        
        # Extract and parse JSON response
        content = response.choices[0].message.content
        # Try to find JSON in the response
        start_idx = content.find('{')
        end_idx = content.rfind('}') + 1
        
        if start_idx != -1 and end_idx != -1:
            json_content = content[start_idx:end_idx]
            insights = json.loads(json_content)
            return {
                "success": True,
                "data": insights
            }
        else:
            # If can't find proper JSON formatting
            try:
                insights = json.loads(content)
                return {
                    "success": True,
                    "data": insights
                }
            except:
                return {
                    "success": False, 
                    "error": "Failed to parse insights data",
                    "raw_content": content
                }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
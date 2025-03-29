"""
College ERP Application Wrapper
This file serves as a wrapper for running the Flask application.
It imports and runs the app from app.py.
"""

from app import app

if __name__ == "__main__":
    # Run the Flask application on all interfaces, port 5000, with debug mode
    app.run(host="0.0.0.0", port=5000, debug=True)
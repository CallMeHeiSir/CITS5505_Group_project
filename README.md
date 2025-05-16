# Exercise Data Visualization & Analysis Platform

## Important Notice
⚠️ This is a private project developed for CITS5505 Agile Web Development unit at UWA. This repository and its contents are not intended for public use or distribution.

## Project Description

This web application is a specialized platform for exercise data visualization and analysis. Its primary purpose is to transform raw exercise data files into meaningful visual insights and analytical reports. Users can upload their exercise data files, which are automatically processed to generate interactive visualizations, statistical analyses, and performance trends. While the platform includes social features, its core strength lies in its sophisticated data processing and visualization capabilities.

### What Makes Us Different
- **Automated Data Processing**: Upload your exercise data files and get instant visualizations
- **Advanced Analytics**: Statistical analysis of exercise patterns and performance metrics
- **Interactive Visualizations**: Dynamic charts and graphs that help you understand your exercise data
- **Secure Data Handling**: Your exercise data is processed securely and can be shared selectively
- **Personalized Insights**: Get detailed analysis of your exercise patterns and progress

### Core Features
- Exercise Data Visualization
  - Interactive charts and graphs for activity metrics
  - Customizable data visualization options
  - Time-based trend analysis
  - Performance metrics visualization

- Data Analysis and Insights
  - Automatic data processing from uploaded files
  - Statistical analysis of exercise patterns
  - Progress tracking and goal monitoring
  - Personalized performance insights

- Private Sharing System
  - Selective sharing of exercise data and reports
  - Customizable privacy settings for each visualization
  - Trusted friend circle for data sharing
  - Private feedback and encouragement system

### Key Technical Features
- Advanced data processing and visualization
- Real-time data analysis
- Interactive dashboard interface
- Secure file upload and processing
- Private data sharing controls
- Personal analytics and progress tracking
- Activity predictions and insights

### Technical Design
The application uses a modern web architecture:
- Backend: Flask (Python) with SQLAlchemy for database management
- Data Processing: NumPy and Pandas for exercise data analysis
- Visualization: Chart.js for interactive data visualization
- Frontend: HTML/CSS with dynamic JavaScript functionality
- Real-time features: Flask-SocketIO for live updates
- Security: Flask-Login for user authentication
- File Processing: Secure file upload and data extraction system
- Email System: Flask-Mail for notifications
- Privacy Controls: Granular access control system

## Project Structure
```
CITS5505_Group_project/
├── backend/           
│   ├── __init__.py
│   ├── activity_records.py
│   ├── analytics.py
│   ├── app.py
│   ├── auth.py
│   ├── checkin.py
│   ├── config.py
│   ├── create_env.py
│   ├── extensions.py
│   ├── forms.py
│   ├── friend.py
│   ├── instance/
│   ├── migrations/
│   ├── models/
│   ├── requirements.txt
│   ├── setup_db.py
│   ├── share.py
│   ├── show_db.py
│   ├── static/
│   │   ├── css/
│   │   ├── js/
│   │   └── images/
│   ├── templates/
│   ├── tests/
│   ├── visualization.py
│   └── venv/
├── .gitignore         
├── forum.html
└── README.md
```

## Team Members

| Student ID | Name         | GitHub Username |
|------------|--------------|-----------------|
| 23824629   | Gawen Hei   | GallMeHeiSir    |
| 24171143   | Yiran Li    | Yiran1Li        |
| 24070858   | Jiazheng Guo| GJZ99123        |
| 24308319   | Guoxing Zhu | uwaguoxing      |

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/CallMeHeiSir/CITS5505_Group_project.git
   cd CITS5505_Group_project
   ```

2. Create and activate a virtual environment:
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   - Obtain the `.env` file from the project administrator
   - Place the `.env` file in the `backend` directory
   - The `.env` file contains necessary configuration including:
     - Email server settings
     - Database configurations
     - Security keys
     - Other sensitive information
   
   ⚠️ Note: For security reasons, the `.env` file is not included in the repository. Please contact the project administrator to obtain the required file.

5. Initialize the database:
   ```bash
   python setup_db.py
   ```

6. Run the application:
   ```bash
   python app.py
   ```

The application will be available at `http://localhost:5000`

## Running Tests





## Additional Notes

- The application requires Python 3.8 or higher
- Make sure to configure your email settings in the `.env` file for the email verification system to work
- For development, use the development server. For production, consider using a production-grade server like Gunicorn

## Data Privacy and Security

### Security Measures
- All user data is stored securely and is not shared with third parties
- User information is protected using encryption
- Email verification required for account creation
- Regular security updates and maintenance
- Local deployment recommended for maximum privacy

### Privacy Controls
- Granular control over data visibility
- Activity sharing is limited to authenticated friends only
- Customizable privacy settings for each data visualization
- Option to keep certain exercise data completely private
- Ability to revoke access to shared data
- Private messaging for secure communication

## References

Beazley, D., & Pallets Team. (2024). *Flask security best practices*. In Flask documentation (Version 3.0.x). https://flask.palletsprojects.com/en/3.0.x/security/

Bootstrap Core Team. (2024). *Getting started with Bootstrap* (Version 5.3). https://getbootstrap.com/docs/5.3/getting-started/introduction/

Chart.js Development Team. (2024). *Chart.js: Simple yet flexible JavaScript charting* (Version 4.4). https://www.chartjs.org/docs/latest/

Grinberg, M. (2024a). *Flask-Login: User session management for Flask* (Version 0.6.3). https://flask-login.readthedocs.io/en/latest/

Grinberg, M. (2024b). *Flask-SocketIO: Socket.IO integration for Flask applications* (Version 5.3.6). https://flask-socketio.readthedocs.io/en/latest/

Gunicorn Development Team. (2024). *Gunicorn: WSGI HTTP server for Unix* (Version 21.2.0). https://docs.gunicorn.org/en/stable/

Kumar, S. (2024). *python-dotenv: Reads key-value pairs from a .env file* (Version 1.0.0). https://github.com/theskumar/python-dotenv

NumPy Development Team. (2024). *NumPy user guide* (Version 2.2). https://numpy.org/doc/stable/

Pallets Team. (2024). *Flask: Web development, one drop at a time* (Version 3.0.x). https://flask.palletsprojects.com/en/3.0.x/

pandas Development Team. (2024). *pandas: Powerful data analysis toolkit* (Version 2.2). https://pandas.pydata.org/docs/

pytest Development Team. (2024). *pytest: Simple powerful testing with Python* (Version 8.0). https://docs.pytest.org/en/stable/

SQLAlchemy Development Team. (2024). *Flask-SQLAlchemy: Adds SQLAlchemy support to Flask* (Version 3.0.x). https://flask-sqlalchemy.palletsprojects.com/en/3.0.x/

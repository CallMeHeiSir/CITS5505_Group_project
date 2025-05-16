# Exercise Data Visualization & Analysis Platform

## Team Members

| Student ID | Name         | GitHub Username |
|------------|--------------|-----------------|
| 23824629   | Gawen Hei   | GallMeHeiSir    |
| 24171143   | Yiran Li    | Yiran1Li        |
| 24070858   | Jiazheng Guo| GJZ99123        |
| 24308319   | Guoxing Zhu | uwaguoxing      |

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
├── backend/                 # Main backend application directory
│   ├── __init__.py         # Flask application initialization
│   ├── activity_records.py  # Activity records management
│   ├── analytics.py        # Data analysis functionality
│   ├── app.py              # Main Flask application
│   ├── auth.py             # Authentication system
│   ├── checkin.py          # Check-in functionality
│   ├── config.py           # Configuration settings
│   ├── create_env.py       # Environment setup
│   ├── extensions.py       # Flask extensions
│   ├── forms.py            # Form definitions
│   ├── friend.py           # Friend system functionality
│   ├── migrations/         # Database migrations
│   │   ├── add_shared_from.py        # Migration for shared data tracking
│   │   └── add_visualization_and_message.py  # Migration for visualization features
│   ├── models/             # Database models
│   │   ├── __init__.py              # Models initialization
│   │   ├── activity_log.py          # Activity logging model
│   │   ├── check_in_log.py          # Check-in records model
│   │   ├── friend.py                # Friend relationship model
│   │   ├── share_log.py             # Data sharing logs model
│   │   ├── user.py                  # User account model
│   │   └── verification_code.py      # Email verification model
│   ├── requirements.txt    # Python package dependencies
│   ├── setup_db.py         # Database initialization script
│   ├── share.py            # Data sharing functionality
│   ├── show_db.py          # Database visualization
│   ├── static/             # Static files directory
│   │   ├── avatars/        # User profile pictures
│   │   ├── css/            # Stylesheets
│   │   │   ├── ch_settings.css     
│   │   │   ├── friends.css          
│   │   │   ├── indexStyle.css       
│   │   │   ├── LoginStyles.css      
│   │   │   ├── settingsStyle.css    
│   │   │   ├── shareStyle.css       
│   │   │   ├── uploadStyle.css      
│   │   │   ├── visualizeStyle.css   
│   │   │   └── WelcomeStyle.css     
│   │   ├── img/            # Image assets
│   │   │   └── welcome-bg.jpg     
│   │   ├── js/             # JavaScript files
│   │   │   ├── ch_password.js       # Password change logic 
│   │   │   ├── friends.js           # Friends functionality 
│   │   │   ├── index.js             # Main page logic 
│   │   │   ├── login.js             # Login functionality 
│   │   │   ├── navigation.js        # Navigation handling 
│   │   │   ├── register.js          # Registration logic 
│   │   │   ├── retrieve_password.js  # Password recovery 
│   │   │   ├── settings.js          # Settings management 
│   │   │   ├── share_modal.js       # Share modal handling 
│   │   │   ├── share.js             # Sharing functionality 
│   │   │   ├── upload.js            # File upload handling 
│   │   │   ├── visualize.js         # Data visualization 
│   │   │   ├── weather.js           # Weather integration 
│   │   │   └── welcome.js           # Welcome page logic 
│   │   └── user_data_templates/  # Upload templates
│   │       └── fitness_data_template.csv  # CSV template 
│   ├── templates/          # HTML templates
│   │   ├── change_password.html  # Password change page 
│   │   ├── index.html            # Main dashboard 
│   │   ├── login.html            # User login page 
│   │   ├── register.html         # User registration 
│   │   ├── retrieve_password.html # Password recovery 
│   │   ├── settings.html         # User settings 
│   │   ├── share.html            # Data sharing page 
│   │   ├── upload.html           # File upload page 
│   │   ├── visualize.html        # Data visualization 
│   │   └── welcome.html          # Welcome page 
│   ├── tests/              # Test directory
│   │   ├── selenium_test/  # Integration tests
│   │   │   ├── all_selenium_tests.py           # Test suite runner
│   │   │   ├── test_change_password-selenium.py # Password change tests
│   │   │   ├── test_edit_profile-selenium.py   # Profile editing tests
│   │   │   ├── test_login-selenium.py          # Login functionality tests
│   │   │   ├── test_register-selenium.py       # Registration tests
│   │   │   └── test_retrieve_password-selenium.py # Password recovery tests
│   │   └── unit_test/      # Unit tests
│   │       ├── run_all_tests.py          # Test runner script
│   │       ├── test_change_password.py    # Password change tests
│   │       ├── test_checkin.py           # Check-in functionality tests
│   │       ├── test_edit_profile.py      # Profile editing tests
│   │       ├── test_login.py             # Login functionality tests
│   │       ├── test_register.py          # Registration tests
│   │       ├── test_retrieve_password.py # Password recovery tests
│   │       ├── test_share.py             # Sharing functionality tests
│   │       ├── test_upload.py            # File upload tests
│   │       ├── test_utils.py             # Utility function tests
│   │       └── test_visualization.py     # Visualization tests
│   └── visualization.py    # Visualization logic
├── .gitignore             # Git ignore rules
└── README.md              # Project documentation
```


## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/CallMeHeiSir/CITS5505_Group_project.git
   cd CITS5505_Group_project
   ```
   OR Unzip the `.zip` compressed file we uploaded in lms
   ```bash
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

4. Set up environment variables（The `.env` file has already been included in the ZIP folder, located under the `backend` directory.）:
   - Obtain the `.env` file from the project administrator
   - Place the `.env` file in the `backend` directory
   - The `.env` file contains necessary configuration including:
     - Email server settings
     - Database configurations
     - Security keys
     - Other sensitive information
   

6. Initialize the database:
   ```bash
   python setup_db.py
   ```

7. Run the application:
   ```bash
   python app.py
   ```

The application will be available at `http://localhost:5000`

## Running Tests
### The project includes a comprehensive test suite to ensure functionality:

#### 1. Check your Chrome browser version

<img width="862" alt="Screenshot 2025-05-16 at 6 13 30 pm" src="https://github.com/user-attachments/assets/8179221f-e17d-4f11-976a-7bf631a35819" />


#### 2.Go to the website shown below, click on `Stable`, and select the ChromeDriver version that matches your Chrome browser.

<img width="903" alt="Screenshot 2025-05-16 at 6 15 37 pm" src="https://github.com/user-attachments/assets/68445e45-523a-4428-93a2-ca519e88cf88" />
<img width="865" alt="Screenshot 2025-05-16 at 6 16 54 pm" src="https://github.com/user-attachments/assets/dc8f6946-2e09-411a-adb6-1459419b795b" />


#### 3. Click the corresponding download link to download it to your local computer
   
<img width="913" alt="Screenshot 2025-05-16 at 6 17 43 pm" src="https://github.com/user-attachments/assets/f5b9d6ca-c532-42e7-b617-64f92a78805c" />


#### 4.Extract the file and locate `chromedriver.exe`.

<img width="874" alt="Screenshot 2025-05-16 at 6 21 03 pm" src="https://github.com/user-attachments/assets/a3097d95-7eba-4df6-9e7d-faec00b03fcc" />

#### 5.Add `chromedriver.exe` to your system's environment variables. Alternatively, you can place `chromedriver.exe` in the Python `Scripts` folder (which was added to your environment variables when you installed Python).

<img width="468" alt="Screenshot 2025-05-16 at 6 21 58 pm" src="https://github.com/user-attachments/assets/58909fcf-5b93-4f93-a868-0eb044b1f3ab" />
<img width="544" alt="Screenshot 2025-05-16 at 6 24 07 pm" src="https://github.com/user-attachments/assets/8ccf9af3-dfbd-43f2-b81f-239664ea7feb" />

#### 6.Activate the virtual environment, then enter the following command in the integrated terminal within the virtual environment to install the `selenium` package (this package should actually be listed in `requirements.txt`).

```bash
  pip install selenium
  ```
#### 7.Load the testing environment configuration in `app.py`.

#### 8.Add the testing environment configuration in `config.py`.(You can switch the order of steps 7 and 8.)

#### 9.Create a `tests` folder under the `backen` directory. Inside the `tests` folder, create two subfolders named `selenium_test` and `unit_test`. Then, create the corresponding test `.py` files inside each subfolder.
<img width="306" alt="Screenshot 2025-05-16 at 6 36 09 pm" src="https://github.com/user-attachments/assets/adbbb826-7e97-4981-a5f4-e5358446df6a" />

#### 10. Also, we have prepared unit test for each major function:
![image](https://github.com/user-attachments/assets/02ffd336-c72a-424a-9684-e7347a5275a4)
You can view it under backend/tests/unittest/, there are 8 related unittests in total.
Each unit_test can be executed through the following code in the `backend` folder.
```bash
python -m unittest tests/unit_test/test_login.py
  ```

#### 11. In the `backend/tests/unit_test` folder, run the following commands to execute the automated tests:
```bash
python run_all_tests.py
  ```
Sample output screenshot:

![image](https://github.com/user-attachments/assets/bc583ea6-ce00-48f1-8beb-4dae60e005c7)


#### 12. In the `backend` folder, run the following commands to execute the automated tests:
```bash
python -m unittest tests/selenium_test/all_selenium_tests.py
  ```
Sample output screenshot:

<img width="480" alt="Screenshot 2025-05-16 at 6 38 58 pm" src="https://github.com/user-attachments/assets/b0d02c81-6663-42e5-b418-129e92786380" />



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
  
## AI Tools Used
This project was developed with the assistance of AI tools including ChatGPT and Claude. These tools were utilized for:
Code logic verification and debugging
Optimization of existing code
Enhancement of design concepts and implementation
Improvement of code structure and readability

## References
- [Chart.js Documentation (v4.4)](https://www.chartjs.org/docs/latest/)
- [Flask-Login Documentation (v0.6.3)](https://flask-login.readthedocs.io/en/latest/)
- [Flask-SocketIO Documentation (v5.3.6)](https://flask-socketio.readthedocs.io/en/latest/)
- [Gunicorn Documentation (v21.2.0)](https://docs.gunicorn.org/en/stable/)
- [python-dotenv Documentation (v1.0.0)](https://github.com/theskumar/python-dotenv)
- [NumPy Documentation (v2.2)](https://numpy.org/doc/stable/)
- [pandas Documentation (v2.2)](https://pandas.pydata.org/docs/)
- [pytest Documentation (v8.0)](https://docs.pytest.org/en/stable/)
- [SQLAlchemy Documentation (v3.0.x)](https://flask-sqlalchemy.palletsprojects.com/en/3.0.x/)
- [GPT-4 Documentation](https://platform.openai.com/docs/models/gpt-4)
- [Claude Documentation](https://docs.anthropic.com/claude/)
- [Grok Documentation](https://grok.x.ai/)

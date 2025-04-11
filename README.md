# Task Management App

A full-stack task management application built with Django and React.

## Features

- User authentication (login/register)
- Team management
- Task management with priority and status
- Google Calendar integration
- Task filtering and search
- Responsive design

## Tech Stack

### Frontend
- React.js
- Material-UI
- Axios for API calls
- React Router for navigation

### Backend
- Django
- Django REST framework
- PostgreSQL
- JWT authentication
- Google Calendar API integration

## Prerequisites

- Python 3.8+
- Node.js 14+
- PostgreSQL
- Google Cloud Project with Calendar API enabled

## Installation

### Backend Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd Task-Management-App/backend
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
Create a `.env` file in the backend directory with:
```env
DEBUG=True
DJANGO_SECRET_KEY=your-secret-key
DB_NAME=taskmanager
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
CORS_ALLOWED_ORIGINS=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=http://localhost:3000
```

5. Set up Google Calendar integration:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google Calendar API
   - Go to "Credentials" and create an OAuth 2.0 Client ID
   - Add authorized JavaScript origins:
     ```
     http://localhost:3000
     http://127.0.0.1:8000
     ```
   - Add authorized redirect URIs:
     ```
     http://localhost:3000/calendar/callback
     ```
   - Download the credentials as `credentials.json` and place it in the backend directory

6. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

7. Start the development server:
```bash
python manage.py runserver
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd ../frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

## Deployment

### Backend Deployment (Django)

1. Set up a production environment:
```bash
# Install production dependencies
pip install gunicorn whitenoise

# Collect static files
python manage.py collectstatic

# Set up environment variables
export DJANGO_SETTINGS_MODULE=core.settings
export DEBUG=False
export SECRET_KEY=your-production-secret-key
export ALLOWED_HOSTS=your-domain.com
export CORS_ALLOWED_ORIGINS=https://your-domain.com
export DATABASE_URL=postgres://user:password@host:port/dbname
```

2. Configure your web server (Nginx example):
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /static/ {
        alias /path/to/your/staticfiles/;
    }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

3. Set up Gunicorn:
```bash
gunicorn core.wsgi:application --bind 127.0.0.1:8000
```

### Frontend Deployment (React)

1. Build the production version:
```bash
npm run build
```

2. Configure your web server (Nginx example):
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/your/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://your-backend-domain.com;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Google Calendar Integration in Production

1. Update Google Cloud Console settings:
   - Add your production domain to authorized JavaScript origins:
     ```
     https://your-domain.com
     ```
   - Add your production callback URL:
     ```
     https://your-domain.com/calendar/callback
     ```

2. Update environment variables:
```env
GOOGLE_CLIENT_ID=your-production-client-id
GOOGLE_CLIENT_SECRET=your-production-client-secret
FRONTEND_URL=https://your-domain.com
```

3. Update the `credentials.json` file with production credentials

## Environment Variables

### Backend (.env)
- `DEBUG`: Django debug mode (True/False)
- `DJANGO_SECRET_KEY`: Django secret key
- `DB_NAME`: PostgreSQL database name
- `DB_USER`: PostgreSQL username
- `DB_PASSWORD`: PostgreSQL password
- `DB_HOST`: PostgreSQL host
- `DB_PORT`: PostgreSQL port
- `CORS_ALLOWED_ORIGINS`: Allowed frontend origins
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `FRONTEND_URL`: Frontend application URL

## API Endpoints

### Authentication
- `POST /api/token/`: Get JWT token
- `POST /api/token/refresh/`: Refresh JWT token
- `POST /api/users/register/`: Register new user

### Tasks
- `GET /api/tasks/`: Get all tasks
- `POST /api/tasks/`: Create new task
- `PUT /api/tasks/<id>/`: Update task
- `DELETE /api/tasks/<id>/`: Delete task

### Teams
- `GET /api/teams/`: Get all teams
- `POST /api/teams/`: Create new team
- `PUT /api/teams/<id>/`: Update team
- `DELETE /api/teams/<id>/`: Delete team

### Calendar
- `GET /api/calendar/auth_url/`: Get Google Calendar auth URL
- `GET /api/calendar/callback/`: Handle OAuth callback
- `GET /api/calendar/events/`: Get calendar events
- `POST /api/calendar/create_event/`: Create calendar event

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
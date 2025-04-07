# Task Management Application

A full-featured task management web application built with Django and React.

## Features

- User Authentication (Register, Login, Logout)
- Task Management
  - Create, Read, Update, Delete tasks
  - Set due dates and priorities
  - Mark tasks as completed
  - Search and filter tasks
- Team Collaboration
- Responsive Design
- External API Integration

## Tech Stack

### Backend
- Django
- Django REST Framework
- PostgreSQL
- Django Authentication System

### Frontend
- React
- React Router
- Axios for API calls
- Material-UI for styling

## Project Structure

```
task-management-app/
├── backend/                 # Django project
│   ├── api/                # Django REST Framework API
│   ├── core/               # Core Django app
│   ├── tasks/              # Tasks app
│   └── users/              # Users app
├── frontend/               # React project
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── public/
└── README.md
```

## Setup Instructions

1. Clone the repository
2. Set up the backend:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```

3. Set up the frontend:
   ```bash
   cd frontend
   npm install
   npm start
   ```

## Testing

Run backend tests:
```bash
cd backend
python manage.py test
```

## License

MIT 
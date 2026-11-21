# Study Resource Organizer

A full-stack web application that helps students organize study materials, manage learning resources, create categories, and maintain personal study notes.

The project was upgraded for the WA-C2 milestone with JWT authentication, a relational PostgreSQL database, automated API tests, and live deployment.

## Live Application

- **Frontend:** https://study-resource-organizer-ecru.vercel.app/
- **Backend:** https://studyresourceorganizer.onrender.com
- **GitHub Repository:** https://github.com/SaniyaPatil296/StudyResourceOrganizer

## Technologies Used

### Frontend

- React.js
- Vite
- JavaScript
- CSS
- HTML

### Backend

- Python
- Django
- Django REST Framework
- Django REST Framework SimpleJWT

### Database

- PostgreSQL (Neon)
- SQLite (local development fallback)

### Deployment

- Vercel – Frontend
- Render – Backend
- Neon – PostgreSQL database

## Features

- User registration and login
- JWT-based authentication
- Protected API endpoints
- Create and manage study categories
- Add and manage study resources
- Create and delete study notes
- User-specific data access
- Secure password storage through Django authentication
- Persistent database storage

## Database Schema

The application uses related database tables with foreign-key relationships.

### 1. User

Stores user account and authentication information.

### 2. Category

Stores study categories.

- `owner`: Foreign key to User
- `name`: Category name
- `description`: Optional description

### 3. StudyResource

Stores learning resources.

- `owner`: Foreign key to User
- `category`: Foreign key to Category
- `title`: Resource title
- `url`: Resource URL
- `description`: Optional description
- `created_at`: Creation timestamp

### 4. StudyNote

Stores notes related to study resources.

- `resource`: Foreign key to StudyResource
- `content`: Note content
- `created_at`: Creation timestamp
- `updated_at`: Last updated timestamp

### Relationships

- One User can own multiple Categories.
- One User can own multiple StudyResources.
- One Category can contain multiple StudyResources.
- One StudyResource can have multiple StudyNotes.

## Authentication

The application uses JWT authentication through Django REST Framework SimpleJWT.

Main authentication endpoints:

- `POST /api/auth/register/` – Register a new user.
- `POST /api/auth/login/` – Log in and receive JWT tokens.

Protected API requests require a valid access token.

## API Endpoints

| Method    | Endpoint           | Purpose                    |
| --------- | ------------------ | -------------------------- |
| GET, POST | `/api/categories/` | List and create categories |
| GET, POST | `/api/resources/`  | List and create resources  |
| GET, POST | `/api/notes/`      | List and create notes      |
| DELETE    | `/api/notes/{id}/` | Delete a note              |

Authentication is required for protected resource operations.

## Automated Testing

The project includes automated API tests using Django REST Framework's APITestCase.

Test coverage includes:

- User registration
- Successful login
- Invalid password handling
- Authentication-required API access
- Category creation
- Resource creation
- Study note creation and deletion
- User data ownership and access restrictions

Run the tests locally:

```bash
python manage.py test
```

**Latest test result: 13 tests passed successfully.**

## Local Setup Instructions

### Backend Setup

Clone the repository:

```bash
git clone https://github.com/SaniyaPatil296/StudyResourceOrganizer.git
cd StudyResourceOrganizer/backend
```

Create and activate a virtual environment:

```bash
python -m venv .venv
.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Apply migrations:

```bash
python manage.py migrate
```

Run the backend:

```bash
python manage.py runserver
```

### Frontend Setup

Open another terminal:

```bash
cd StudyResourceOrganizer/frontend
npm install
```

Configure the frontend API URL using the backend address in your local environment.

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

Start the frontend:

```bash
npm run dev
```

## Deployment

- Frontend deployed using Vercel.
- Backend deployed using Render.
- PostgreSQL database hosted on Neon.

Production database credentials and other secrets are configured through deployment environment variables and must not be committed to GitHub.

## WA-C2 Milestone

This project demonstrates:

- Full authentication with registration and login.
- Protected API endpoints.
- A relational database with four related tables.
- Automated authentication and CRUD testing.
- Live full-stack deployment.
- Secure password handling and secret management.

**Project Status:** WA-C2 implementation and local automated tests completed.

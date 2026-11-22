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

## WA-8 Milestone: Real-Time WebSocket Notifications

The Study Resource Organizer has been upgraded with real-time notifications using Django Channels and WebSockets.

### Technologies Used

- Django Channels
- Daphne ASGI Server
- WebSockets
- JWT Authentication
- React.js
- JavaScript
- CSS
- InMemoryChannelLayer

### Features Implemented

- Real-time WebSocket connection between React frontend and Django backend.
- JWT-based authentication for WebSocket connections.
- Private notification groups for individual authenticated users.
- Automatic notifications when a user creates a category.
- Automatic notifications when a user adds a study resource.
- Automatic notifications when a user creates a study note.
- Live notification panel in the React dashboard.
- Connection status indicator (Connected, Connecting, Disconnected).
- Notification timestamps.
- Clear All notification functionality.
- Automatic WebSocket disconnection when the component unmounts or the user logs out.

### WebSocket Endpoint

```text
ws://127.0.0.1:8000/ws/notifications/?token=YOUR_ACCESS_TOKEN
```

The WebSocket connection uses the user's JWT access token for authentication.

### Notification Events

| Event            | Description                       |
| ---------------- | --------------------------------- |
| category_created | A new study category was created. |
| resource_created | A new study resource was added.   |
| note_created     | A new study note was created.     |

### Backend Configuration

The project uses Django Channels with an InMemoryChannelLayer for local development.

The ASGI application is configured in:

```text
backend/config/asgi.py
```

WebSocket authentication middleware:

```text
backend/config/jwt_middleware.py
```

WebSocket consumer:

```text
backend/resources/consumers.py
```

WebSocket routing:

```text
backend/resources/routing.py
```

Notification events are triggered from:

```text
backend/resources/views.py
```

### Run the WebSocket Backend

Activate the backend virtual environment and navigate to the backend directory.

Start the Daphne ASGI server:

```bash
python -m daphne -b 127.0.0.1 -p 8000 config.asgi:application
```

### Frontend Configuration

Create or update the frontend `.env` file:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

Start the React application:

```bash
npm run dev
```

Open:

```text
http://localhost:5173/
```

Log in to connect to your private notification channel.

### Testing Real-Time Notifications

The following tests were successfully performed locally:

1. Created a category and verified its notification appeared automatically.
2. Added a study resource and verified its notification appeared automatically.
3. Created a study note and verified its notification appeared automatically.
4. Opened two browser sessions using different user accounts.
5. Created a category using the second account.
6. Verified that the second account received the notification while the first account did not.

### Notification Privacy

Each authenticated user is assigned a separate notification group:

```text
study_notifications_USER_ID
```

This ensures that notifications are delivered to the corresponding user's WebSocket connection rather than being broadcast to all users.

### Channel Layer Note

The current InMemoryChannelLayer configuration is intended for local development and single-process testing. A Redis-based channel layer is recommended for multi-process production deployments.

**WA-8 Status:** Real-time WebSocket notifications implemented and successfully tested locally.

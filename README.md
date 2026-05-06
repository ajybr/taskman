# TASKMAN

A task management application with project-based organization, team collaboration, and invite-based access.

## Tech Stack

- **Runtime**: Bun
- **Monorepo**: Turbo
- **Frontend**: Next.js 16, React 19, Zustand, React Query
- **Backend**: Express 5
- **Database**: PostgreSQL (Neon), Drizzle ORM
- **Styling**: Tailwind CSS 4

## Data Flow

```mermaid
graph TD
    Users[Users] -->|creates| Projects
    Projects -->|has many| Tasks
    Projects -->|has many| ProjectMembers
    Users -->|belongs to| ProjectMembers
    Projects -->|generates| Invites[Project Invites]
    Invites -->|accepted by| Users

    subgraph Project
        Projects
        Tasks
        ProjectMembers
    end

    subgraph Auth Flow
        Signup --> Login
        Login --> JWT
    end
```

## Database Schema

### ER Diagram

```mermaid
erDiagram
    USERS {
        uuid id PK
        string name
        string email UK
        string passwordHash
        timestamp createdAt
    }

    PROJECTS {
        uuid id PK
        string name
        string description
        uuid createdBy FK
        timestamp createdAt
    }

    PROJECT_MEMBERS {
        uuid projectId PK,FK
        uuid userId PK,FK
        string role
        timestamp joinedAt
    }

    TASKS {
        uuid id PK
        uuid projectId FK
        string title
        string description
        string priority
        string status
        uuid assignedTo FK
        uuid createdBy FK
        date dueDate
        timestamp createdAt
    }

    PROJECT_INVITES {
        uuid id PK
        uuid projectId FK
        string inviteToken UK
        uuid invitedBy FK
        string role
        timestamp acceptedAt
        timestamp expiresAt
    }

    USERS ||--o{ PROJECTS : "creates"
    PROJECTS ||--o{ PROJECT_MEMBERS : "has"
    USERS ||--o{ PROJECT_MEMBERS : "belongs to"
    PROJECTS ||--o{ TASKS : "contains"
    TASKS }o--|| USERS : "assigned to"
    TASKS }o--|| USERS : "created by"
    PROJECTS ||--o{ PROJECT_INVITES : "generates"
    USERS ||--o{ PROJECT_INVITES : "sends"
```

## Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Configure your database (Neon recommended)
# DATABASE_URL="postgresql://user:pass@host:5432/db"

# Generate a secure JWT secret
# JWT_SECRET="your-secret-key"
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT token signing
- `WEB_URL` - Frontend URL (default: http://localhost:3000)
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:4000/api)

## Demo

For demo purposes, you can login with:
- **Email**: user@demo.com
- **Password**: 12345678

## Development

```bash
# Install dependencies
bun install

# Run all services (web + server)
bun run dev

# Or run individually:
bun run dev:web   # Next.js on port 3000
bun run dev:server # Express on port 4000
```

## Deployment

### Database
Use [Neon](https://neon.tech) for serverless PostgreSQL.

### App
Deploy to [Railway](https://railway.app) - configured in `railway.json`.

```bash
# Set environment variables in Railway dashboard:
# - DATABASE_URL (from Neon)
# - JWT_SECRET
# - WEB_URL (your railway app URL)
# - NEXT_PUBLIC_API_URL (your railway app URL + /api)
```

## Project Structure

```
apps/
├── web/         # Next.js frontend
└── server/      # Express API

packages/
├── auth/        # JWT & password utilities
├── db/          # Drizzle ORM schema & client
└── types/       # Shared TypeScript types
```

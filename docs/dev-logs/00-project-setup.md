# Project Setup

## Goal

Set up the initial full-stack development environment for the project.

The application is structured as a React frontend communicating with an Express backend. The backend uses PostgreSQL as the primary database and Redis as an in-memory data store.

## Technology Choices

### Package Manager

I chose **pnpm** as the package manager.

Reasons:

- Fast dependency installation
- Efficient disk usage
- Strict dependency management
- Good support for workspaces

### Frontend

The frontend uses:

- React
- TypeScript
- Tailwind CSS
- Vite

Vite is used as the development and build tool.

React and TypeScript are used for building the frontend application.

Tailwind CSS is used for styling.

React Compiler is enabled to provide automatic React optimizations.

### Backend

The backend uses:

- Node.js
- Express
- TypeScript



### Database

The main persistent database is **PostgreSQL**.

PostgreSQL will store application data that needs to persist between server restarts.

### Redis

Redis is included as an in-memory data store.

It can be used for functionality such as:

- Caching
- Rate limiting
- Temporary data
- Session-related data
- Token/session management where appropriate

Redis will only be used when it provides a meaningful advantage over PostgreSQL.

---

## Development Choices:
- Both the **React Frontend** and the **Express Backend** will be hosted locally during development while The **PostgreSQL Db** and **Redis Db** services will run in containers. To have fast development and easier debuging.
- The project seperates the frontend from the backend


## Problems Encountered and solutions:
- **Problem**: Race condtion between Exparess backend and the databases when starting (Express might start before db).
  **Solution**: Repeat trying to connect for a fixed number of attempts (instead of using healthcheck or depends on because we prefered to develop the express api locally)

- 

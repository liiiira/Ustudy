# UStudy

UStudy is a Computer Science educational platform built primarily as a project to explore, practice, and showcase modern full-stack development practices.

The platform is designed around CS education, but a major goal of the project is to demonstrate the engineering decisions behind building a complete web application: backend architecture, database design, testing, migrations, containerization, API design, and development tooling.

## Tech Stack

### Frontend

* **React** — UI development
* **TypeScript** — type safety
* **Vite** — development server and build tooling
* **Tailwind CSS** — styling

### Backend

* **Node.js**
* **Express** — HTTP server and API
* **TypeScript**
* **PostgreSQL** — primary database
* **pg** — direct PostgreSQL access without an ORM
* **Redis** — caching and other fast-access data

The backend intentionally does **not use an ORM**. PostgreSQL is accessed directly through the `pg` package, giving more control over SQL queries, database interactions, and schema design.

### Infrastructure & Testing

* **Docker / Docker Compose** — PostgreSQL and Redis containers
* **Migrations** — version-controlled database schema changes
* **Supertest** — HTTP/API testing
* **Jest** — testing
* **Bash** — automation scripts for development and testing

## Architecture

The backend follows a layered architecture:

```text
HTTP Request
     │
     ▼
 Controller
     │
     ▼
  Service
     │
     ▼
 Repository
     │
     ▼
 PostgreSQL
```

Middleware is used for cross-cutting concerns such as request validation and error handling.

The responsibilities are intentionally separated:

* **Controllers** handle HTTP requests and responses.
* **Services** contain business logic.
* **Repositories** are responsible for database interaction.
* **Middlewares** handle concerns such as validation and centralized error handling.

This separation makes the codebase easier to test, maintain, and extend.

## Database

UStudy uses **PostgreSQL** as its primary relational database.

Instead of relying on an ORM, database operations are written using SQL through the `pg` package. This makes the SQL layer explicit and provides direct control over queries and PostgreSQL features.

Database changes are managed through **migrations**. The schema evolves using a forward migration strategy, allowing database changes to be tracked and reproduced consistently across environments.

PostgreSQL and Redis run in containers using Docker Compose.

## Testing

Testing is treated as part of the development workflow rather than something added at the end.

The project uses:

* **Jest** for writing and running tests
* **Supertest** for testing the HTTP API

A separate testing database is used so that tests do not interfere with development data.

Bash scripts are also used to automate repetitive testing tasks such as starting the test database and running the test suite.

The goal is to make the testing workflow simple and reproducible.

## Development Logs

One of the main purposes of UStudy is to document the development process and the technical decisions made throughout the project.

The project therefore includes **development logs (devlogs)** covering topics such as:

* Backend architecture
* Database design
* Migrations
* Repository and service patterns
* API design
* Testing
* Docker and development environments
* Technical design decisions

These devlogs are intended to show not only **what was built**, but also **why it was built that way**.

## Educational Platform

UStudy is designed as a platform for **Computer Science education**.

The platform can be used to organize and provide educational content around areas such as programming, algorithms, data structures, and other CS-related subjects.

The broader idea is to provide an environment where learners can access educational material while the project itself serves as a practical demonstration of how such a platform can be engineered.

## Project Goals

UStudy has two main goals:

### 1. Build a CS Educational Platform

Provide a foundation for a platform focused on learning and sharing Computer Science knowledge.

### 2. Showcase Engineering Skills

Use the project to demonstrate practical skills across the full stack, including:

* React and modern frontend development
* REST API development with Express
* TypeScript
* Relational database design
* Writing SQL without an ORM
* PostgreSQL
* Redis
* Docker and containerized services
* Database migrations
* Automated testing
* API testing
* Layered backend architecture
* Bash scripting
* Development documentation

The project is therefore as much about **the engineering process and technical decisions** as it is about the final application.

## Status

UStudy is an ongoing project. New features, improvements, tests, and technical experiments are added progressively and documented through the project's devlogs.


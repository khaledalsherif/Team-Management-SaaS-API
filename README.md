# 🚀 Team Management SaaS API

A powerful backend API for managing teams, projects, tasks, and comments with **role-based access control**.  
Designed to support scalable collaboration with secure and structured workflows.

---

## 📌 Overview

The **Team Management SaaS API** enables organizations to:

- Manage teams and members efficiently
- Organize projects and tasks
- Collaborate via comments
- Control access using roles:
  - **Owner**
  - **Manager**
  - **Member**

---

## 🛠 Tech Stack

| Layer          | Technology                       |
| -------------- | -------------------------------- |
| Backend        | Express.js                       |
| ORM            | Prisma                           |
| Database       | PostgreSQL                       |
| Validation     | Zod                              |
| Authentication | JWT + bcrypt                     |
| Security       | Helmet, Rate Limiting            |
| Error Handling | Custom AppError + Global Handler |

---

## ⚙️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/khaledalsherif/Team-Management-SaaS-API.git
cd team-management-saas-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/teamdb"
JWT_SECRET="your-secret"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
```

### 4. Run Database Migrations

```bash
npx prisma migrate dev
```
### 5. BUILD CLIENT

```bash
npx prisma generate
```

### 6. Start the Server

```bash
npm start
```

---

## 🔐 Authentication

| Action | Endpoint                    |
| ------ | --------------------------- |
| Signup | `POST /api/v1/users/signup` |
| Login  | `POST /api/v1/users/login`  |

🔑 Use JWT token in headers:

```http
Authorization: Bearer <token>
```

---

## 👥 Roles & Permissions

| Role    | Permissions                                  |
| ------- | -------------------------------------------- |
| Owner   | Full control over teams, projects, and tasks |
| Manager | Manage projects & tasks, add members         |
| Member  | View assigned tasks, add comments            |

---

## 📡 API Endpoints

### 👤 Users

```http
POST   /api/v1/users/signup        → Register new user
POST   /api/v1/users/login         → Login
GET    /api/v1/users               → Get all users (Admin only)
GET    /api/v1/users/:userId       → Get user by ID (Admin only)
DELETE /api/v1/users/:userId       → Delete user (Admin only)
```

---

### 👥 Teams

```http
POST   /api/v1/teams                        → Create team (Owner only)
GET    /api/v1/teams                        → Get user teams
GET    /api/v1/teams/:teamId                → Get team members
PATCH  /api/v1/teams/:teamId                → Add member
PATCH  /api/v1/teams/:teamId/changeRole     → Change role (Owner only)
DELETE /api/v1/teams/:teamId                → Remove member
```

---

### 📁 Projects

```http
POST   /api/v1/projects/:teamId                     → Create project
GET    /api/v1/projects/:teamId                     → Get all projects
GET    /api/v1/projects/:teamId/:projectId          → Get project details
PATCH  /api/v1/projects/:teamId/:projectId          → Update project
DELETE /api/v1/projects/:teamId/:projectId          → Delete project
```

---

### ✅ Tasks

```http
POST   /api/v1/projects/:teamId/:projectId/tasks                    → Create task
GET    /api/v1/projects/:teamId/:projectId/tasks                    → Get tasks
GET    /api/v1/projects/:teamId/:projectId/tasks/:taskId            → Task details
PATCH  /api/v1/projects/:teamId/:projectId/tasks/:taskId            → Update task
DELETE /api/v1/projects/:teamId/:projectId/tasks/:taskId            → Delete task
```

---

### 💬 Comments

```http
POST   /api/v1/projects/:teamId/:projectId/tasks/:taskId/comments                    → Add comment
GET    /api/v1/projects/:teamId/:projectId/tasks/:taskId/comments                    → Get comments
GET    /api/v1/projects/:teamId/:projectId/tasks/:taskId/comments/:commentId         → Get comment
PATCH  /api/v1/projects/:teamId/:projectId/tasks/:taskId/comments/:commentId         → Update (author only)
DELETE /api/v1/projects/:teamId/:projectId/tasks/:taskId/comments/:commentId         → Delete (author/Owner/Manager)
```

---

## ⚠️ Error Handling

- ✅ Custom `AppError` class for operational errors
- 🌍 Global error handler with:
  - Development mode (detailed errors)
  - Production mode (safe responses)
- 🛢 Prisma errors handled:
  - Duplicate fields
  - Invalid IDs
  - Constraint violations

---

## 📦 Features

- 🔐 Secure authentication & authorization
- 🧠 Role-based access control (RBAC)
- 📊 Structured project & task management
- 💬 Comment system for collaboration
- ⚡ Scalable architecture using Prisma

## --

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create a new branch
3. Commit your changes
4. Open a Pull Request

---

## ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub!

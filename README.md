# Project-Centric File Processing System (Frontend)

##  Overview

This is a **React + TypeScript frontend application** for a **Project-Centric File Processing System**.

The application allows users to:

* Authenticate securely
* Manage projects
* Upload and manage files per project
* Track background processing jobs

It integrates with backend APIs to provide a seamless and responsive user experience.

---

## Tech Stack

* **React** (with Hooks)
* **TypeScript**
* **React Router**
* **CSS Custom Styles** 

---

## Folder Structure

```
/src
  /components     # Reusable UI components
  /pages          # Route-level pages
  /hooks          # Custom React hooks
  /services       # API service layer
  /context        # Global state (Auth, etc.)
  /styles         # Styling files
```

---

##  Authentication Module

###  Login Page

**Route:** `/login`

#### Fields:

* Email
* Password

#### Features:

* API-based authentication
* Token storage (localStorage / context)
* Protected routes after login

---

## Project Management

### Project List Page

**Route:** `/projects`

#### Features:

* Fetch and display all projects
* Create new project
* Navigate to project-specific files
* Delete or manage projects

---

## File Management (Project-Scoped)

### Upload Files

#### Features:

* Upload multiple files
* Progress tracking
* Error handling & retry logic
* File list per project

#### Flow:

1. Select project
2. Upload files
3. Files processed in backend
4. Status updated via jobs

---

## Job Management

#### Features:

* Track background jobs
* View job status (Pending / Processing / Completed / Failed)
* Real-time or polling updates

---

## API Integration

All API calls are managed via the `/services` layer.

Example structure:

```
services/
  authService.ts
  projectService.ts
  fileService.ts
  jobService.ts
```

---

## 🧠 State Management

Global state handled using **Context API**:

* `AuthContext` → Authentication state

---

## Protected Routes

* Implemented using a custom `ProtectedRoute` component
* Redirects unauthenticated users to `/login`

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

---

### 2. Install dependencies

```bash
npm install
```

---

### 3. Run the app

```bash
npm run dev
```

---

### 4. Build for production

```bash
npm run build
```

---

## Key Features Summary

* Authentication with protected routes
* Project-based architecture
* File uploads with progress tracking
* Background job tracking
* Clean modular folder structure
* Scalable and maintainable codebase

---

## Future Improvements

* Real-time updates using WebSockets
* Role-based access control
* Drag & drop file upload
* Pagination for projects

---

## Author

**Rishab Raj Verma**

---

## License

This project is for assignment/demo purposes.

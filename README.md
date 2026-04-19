File Management & ZIP Job System

A modern React + TypeScript application for managing projects, uploading files, and generating downloadable ZIP archives asynchronously.

 Features
 Project Management
Create, view, and delete projects
Paginated project listing
Project metadata (files count, jobs count, created date)
 File Management
Upload multiple files
Drag & drop support
File preview before upload
File validation (size, type restrictions)
Download & delete files
 ZIP Job System
Select files and create ZIP jobs
Real-time job progress tracking (polling)
Download completed ZIP files
Delete ZIP jobs
 Authentication
Login with token-based authentication
Protected routes
Persistent session via localStorage
 Tech Stack
Frontend: React + TypeScript
State Management: useReducer + Context API
Routing: React Router
HTTP Client: Axios
Styling: CSS Modules
Testing: Vitest + React Testing Library
 Folder Structure
src/
│
├── components/        # Reusable UI components (Modal, Layout, Loader)
├── pages/             # Page-level components
│   ├── login/
│   ├── Projects/
│   ├── ProjectDetails/
│
├── services/          # API service layer
├── hooks/             # Custom hooks (pagination, auth)
├── reducers/          # State reducers
├── context/           # Auth context provider
├── models/            # TypeScript types
├── auth/              # Protected routes
├── assets/            # Images/icons
 Authentication Flow
User logs in via /login
Token is received from API
Token stored in localStorage
Axios interceptor attaches token to every request
Protected routes check authentication state
 Installation & Setup
# Clone repo
git clone <your-repo-url>

# Install dependencies
npm install

# Run development server
npm run dev
 Environment Variables

Create a .env file:

VITE_BASE_URL=http://localhost:5000/api
 API Integration

All API calls are centralized using Axios:

projectService → project 
FileService → file upload/download/delete
ZipService → zip job creation & tracking
loginApi → authentication
 ZIP Job Flow
User selects files
Clicks Create ZIP Job
Backend returns jobId
Frontend polls job status every 3s
On completion:
Progress = 100%
File becomes downloadable
 Testing Setup

Global test setup:

afterEach(() => {
  cleanup();
});

Run tests:

npm run test
 Important Design Decisions
1. Polling instead of WebSockets
Simpler implementation
Works reliably for async jobs
2. Reducer-based state
Predictable state updates
Better than multiple useState for complex flows
3. Service layer abstraction
Keeps components clean
Centralized error handling
 Known Limitations
No refresh token mechanism
No real-time updates (polling used)
No file type filtering UI (basic validation only)
Modal lacks focus trapping (basic accessibility)
 Future Improvements
Add WebSocket support for real-time job updates
Implement refresh token authentication
Add file type filtering & sorting
Improve modal accessibility (focus trap)
Add drag-select & bulk actions
Add retry for failed jobs
 Developer Notes
Avoid using any → use unknown + type guards
Always handle API errors via helper (getErrorMessage)
Clean up side effects (useEffect)
Keep services pure (no UI logic)
 Scripts
npm run dev       # Start dev server
npm run build     # Build project
npm run preview   # Preview build
npm run test      # Run tests



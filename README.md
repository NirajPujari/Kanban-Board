# 🧩 [Kanban Board](https://yourskanbanboard.vercel.app/)

### Next.js frontend + TypeScript backend + MongoDB

A Kanban board app. Frontend is Next.js (TypeScript). Backend API routes live inside the Next app (app router). MongoDB stores users and tasks. Auth uses JWT. Designed for local dev, Docker, and Vercel deployments.

#

## 📸 Screenshots

![This is an alt text.](/public/login.jpg "This is a sample image.")
![This is an alt text.](/public/signup.jpg "This is a sample image.")
![This is an alt text.](/public/dashboard.jpg "This is a sample image.")
![This is an alt text.](/public/dashboard.jpg "This is a sample image.")
![This is an alt text.](/public/admin.png "This is a sample image.")

#

## ⚙️ Tech Stack
- **Frontend:** Next.js (App Router) + TypeScript  
- **Backend:** Next.js API Routes (TypeScript)  
- **Database:** MongoDB (recommended: Atlas)  
- **Authentication:** JWT (NextAuth optional)  
- **Tooling:** Node 18+, ESLint, Prettier, Vitest/Jest, ettc

#

## 🚀 Features
- User signup and login  
- CRUD operations for tasks  
- Task categorization (To-do, In-progress, Done)  
- Priority levels, labels, and assignments  
- Admin and user role-based access  
- RESTful API routes for users and tasks  

#

## 📂 Project Structure

```
/
├─ app/                       # Next.js App Router pages & API handlers
│  ├─ (api)/
│  │  ├─ admin/
│  │  │  ├─ tasks/
│  │  │  │  ├─ [id]/route.ts  # PUT, DELETE
│  │  │  │  └─ route.ts  # GET, POST
│  │  │  └─ user/
│  │  │     ├─ [id]/route.ts  # PUT, DELETE
│  │  │     └─ route.ts  # GET, POST
│  │  ├─ auth/
│  │  │  ├─ login/route.ts  # POST
│  │  │  ├─ logout/route.ts  # POST
│  │  │  └─ signup/route.ts  # POST
│  │  ├─ user/
│  │  │  ├─ [id]/route.ts  # GET
│  │  │  └─ tasks/
│  │  │     └─ [id]/route.ts  # GET, POST PUT, DELETE
│  ├─ (page)/
│  │  ├─ admin/page.tsx
│  │  ├─ dashboard/[id]/page.tsx
│  │  ├─ login/page.tsx
│  │  └─ signup/page.tsx
│  ├─ components
│  |  ├─ Card.tsx
│  |  └─ Column.tsx
│  |  └─ Loader.tsx
│  ├─ lib/
│  │  └─ db.ts                   # Mongo connection helper
│  ├─ types/index.ts
│  ├─ utils/
│  │  ├─ auth.ts
│  │  ├─ dndUtils.ts
│  │  ├─ jwt.ts
│  │  └─ localStorgae.ts
│  ├─ globals.css
│  ├─ layout.tsx
│  ├─ not-found.tsx
│  └─ page.tsx
├─ public/
├─ .env
├─ .example.env
├─ .example.env
├─ package.json
└─ README.md
```

#

## 🧠 Data Models

### User (example)
```
type User = {
  _id: string;
  name: string;
  email: string;
  password: string;
  createdAt?: Date;
  lastLogin?: Date | null;
};
```

### Task (example)

```
Task = {
  _id: string;
  userId: string;
  header: string;
  desc: string;
  level: number;
  person: string;
  type: BoardLane;
};
```

#

## 🌐 API Endpoints
### Use these as the canonical endpoints for frontend integration.

### Admin Routes
* GET /admin/tasks — fetch tasks
* POST /admin/tasks — create tasks
* PUT /admin/tasks/{id} - update tasks
* DELETE /admin/tasks/{id} - delete tasks
* GET /admin/user — fetch user
* POST /admin/user — create user
* PUT /admin/user/{id} - update user
* DELETE /admin/user/{id} - delete user

### Auth Routes
* POST /auth/login - login for user
* POST /auth/signup - signup for user
* POST /auth/tasks/{id} — logout for user

### User Routes
* GET /user/{id} - Fetch user by id
* GET /user/tasks/{id} — fetch tasks by userId
* POST /user/tasks/{id} — create tasks by userId
* PUT /user/tasks/{id} - update tasks by taskId
* DELETE /user/tasks/{id} - delete tasks by taskId

#

### ⚙️ Environment Variables
Create .env (do not commit).
NODE_ENV=development
PORT=3000

DB_CONNECTION_STRING=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/kanban?retryWrites=true&w=majority
DB_NAME="MongoDB Name"
JWT_SECRET="Screat_key"
JWT_EXPIRES_IN="Time_Duration"

#

### 🚀 Installation & Running
1. Clone the repository
    ```
    git clone https://github.com/NirajPujari/Kanban-Board
    cd Kanban-Board
    ```
2. Copy .env.example to .env and edit values.
3. Install dependencies:
    ```
    # pnpm
    pnpm install

    # or npm
    npm install
    ```
4. Run dev server:
    ```
    pnpm dev
    # or
    npm run dev

    ```
5. Open http://localhost:3000.

#

## 🐳 Docker (Optional)
docker-compose.yml with a Mongo service and the app (node). For production prefer deploying Next to Vercel and Mongo to Atlas.

#

### Scripts (suggested package.json)
```
{
  "name": "kanban-board",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/modifiers": "^9.0.0",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "bcryptjs": "^3.0.3",
    "cookie": "^1.0.2",
    "framer-motion": "^12.23.24",
    "jsonwebtoken": "^9.0.2",
    "lucide-react": "^0.542.0",
    "mongodb": "^6.20.0",
    "next": "15.5.2",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "sonner": "^2.0.7"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@tailwindcss/postcss": "^4",
    "@types/bcryptjs": "^2.4.6",
    "@types/cookie": "^0.6.0",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "15.5.2",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

#

## 🪪 License
MIT.

#

## 🙌 Credits
Developed by Niraj Pujari as a modern full-stack Kanban task management application using Next.js + TypeScript + MongoDB.
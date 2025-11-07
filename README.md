# [Kanban Board](https://yourskanbanboard.vercel.app/)

![This is an alt text.](/public/login.jpg "This is a sample image.")
![This is an alt text.](/public/signup.jpg "This is a sample image.")
![This is an alt text.](/public/dashboard.jpg "This is a sample image.")

### Next.js frontend + TypeScript backend + MongoDB

A Kanban board app. Frontend is Next.js (TypeScript). Backend API routes live inside the Next app (app router). MongoDB stores users and tasks. Auth uses JWT. Designed for local dev, Docker, and Vercel deployments.

#

### Tech stack
* Frontend: Next.js (App Router), TypeScript
* Backend: Next.js API routes (TypeScript)
* DB: MongoDB (recommended: Atlas)
* Auth: JWT (or NextAuth if preferred)
* Tooling: Node 18+, pnpm / npm / yarn, ESLint, Prettier, Vitest/Jest (optional)

#

### Features
* User signup / login.
* CRUD tasks with columns (todo, in-progress, done).
* Task assignments, priorities, user, labels.
* Admin routes for user/task management.
* Role-based access (admin / user).
* RESTful API routes under /api (mirrors app routes like /admin/tasks/[id]).

#

### Repository layout (recommended)
```
/
├─ app/                       # Next.js App Router pages & API handlers
│  ├─ (api)/
│  │  ├─ admin/
│  │  │  ├─ tasks/
│  │  │  │  ├─ [id]/route.ts  # PUT, DELETE
│  │  │  │  └─ route.ts  # GET, POST
│  │  │  ├─ user/
│  │  │  │  ├─ [id]/route.ts  # PUT, DELETE
│  │  │  │  └─ route.ts  # GET, POST
│  │  ├─ user/
│  │  │  ├─ [id]/route.ts  # GET
│  │  │  ├─ login/route.ts  # POST
│  │  │  ├─ signup/route.ts  # POST
│  │  │  ├─ tasks/
│  │  │  │  ├─ [id]/route.ts  # GET, POST PUT, DELETE
│  ├─ (id)/page.tsx
│  ├─ components
│  |  ├─ Card.tsx
│  |  └─ Column.tsx
│  ├─ lib/
│  │  └─ db.ts                   # Mongo connection helper
│  ├─ login/page.tsx
│  ├─ signup/page.tsx
│  ├─ types/index.ts
│  ├─ utils/
│  │  ├─ dndUtils.ts
│  │  └─ localStorgae.ts
│  ├─ globals.css
│  ├─ layout.tsx
│  └─ page.tsx
├─ public/
├─ .env
├─ .example.env
├─ .example.env
├─ package.json
└─ README.md
```

#

### Data models (TypeScript interfaces)
User (example)
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

Task (example)

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

### Important API routes
#### Use these as the canonical endpoints for frontend integration.

Admin Routes
* GET /admin/tasks — fetch tasks
* POST /admin/tasks — create tasks
* PUT /admin/tasks/{id} - update tasks
* DELETE /admin/tasks/{id} - delete tasks
* GET /admin/user — fetch user
* POST /admin/user — create user
* PUT /admin/user/{id} - update user
* DELETE /admin/user/{id} - delete user

User Routes
* GET /user/{id} - Fetch user by id
* POST /user/login - login for user
* POST /user/signup - signup for user
* GET /user/tasks/{id} — fetch tasks by userId
* POST /user/tasks/{id} — create tasks by userId
* PUT /user/tasks/{id} - update tasks by taskId
* DELETE /user/tasks/{id} - delete tasks by taskId

#

### Environment variables
Create .env (do not commit).
NODE_ENV=development
PORT=3000

DB_CONNECTION_STRING=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/kanban?retryWrites=true&w=majority
DB_NAME="MongoDB Name" 

#

### Setup (local)
1. Install Node 18+.
2. Clone repo.
3. Copy .env.example to .env and edit values.
4. Install dependencies:
    ```
    # pnpm
    pnpm install

    # or npm
    npm install
    ```
5. Run dev server:
    ```
    pnpm dev
    # or
    npm run dev

    ```
6. Open http://localhost:3000.

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
    "bcryptjs": "^3.0.2",
    "framer-motion": "^12.23.24",
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

### Docker (optional)
docker-compose.yml with a Mongo service and the app (node). For production prefer deploying Next to Vercel and Mongo to Atlas.

#

### Contributing
1. Fork.
2. Create branch feature/short-description.
3. Add tests.
4. Open PR with description and screenshot (if UI).

#

### License
MIT (or your chosen license).
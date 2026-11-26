# Task Manager Client

React + TypeScript + Vite front end for the Task Management App. It lists tasks from the API,
creates new ones, filters by status and updates a task's status. Styling is plain CSS — no UI
library.

## Related repository

- **API:** [sprout-assessment-backend](https://github.com/David-Uk/sprout-assessment-backend)
  — the Express API this client calls. It also holds the SQL scripts, the CI workflow and the
  Scalar API reference. **The API must be running before this client can load tasks.**

## Features

- Task list fetched from `GET /api/tasks`, newest first
- Create form with client-side validation (title 1–150, description ≤1000)
- Per-task status dropdown using `PATCH /api/tasks/:id/status`
- Status filter: All / Pending / In Progress / Completed
- Loading messages for list, create and update actions
- Error messages for failed requests, including "API unreachable"
- Empty state ("No tasks yet")
- Responsive two-column layout that stacks on mobile
- Buttons/selects disabled while a request is in flight (no double submits)
- Labels, fieldsets, focus styles and an `aria-live` notification region

## Configuration

```bash
cp .env.example .env
```

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Base URL for all API calls, e.g. `http://localhost:3000/api` |
| `VITE_USE_DEV_PROXY` | Optional: `true` proxies `/api` to the backend during development |
| `VITE_API_TARGET` | Proxy target when the dev proxy is enabled (default `http://localhost:3000`) |

All requests go through `src/api/client.ts`; there are no hard-coded API URLs in components.

If you prefer the Vite dev proxy over CORS:

```bash
# .env
VITE_API_BASE_URL=/api
VITE_USE_DEV_PROXY=true
```

`VITE_*` variables are bundled into browser code — never put secrets in `.env`.

## Local development

Prerequisites: Node.js 22+ and npm.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + production build
npm run lint      # ESLint
npm test          # Vitest + React Testing Library
```

If not using the dev proxy, make sure the API's `CORS_ORIGIN` includes `http://localhost:5173`.

## Project structure

```
src/
├── api/client.ts           # all fetch calls + error normalisation
├── components/
│   ├── StatusFilter.tsx
│   ├── TaskForm.tsx
│   └── TaskList.tsx
├── test/
│   ├── setup.ts            # jest-dom matchers + RTL cleanup
│   ├── apiClient.test.ts
│   └── App.test.tsx
├── App.tsx / App.css       # layout and state orchestration
├── index.css               # global reset and focus styles
├── types.ts                # Task, Status and shared types
└── main.tsx
```

## Outstanding / known limitations

- No pagination controls in the UI (the API supports `page`/`limit`).
- No authentication or user-specific tasks.
- No deployment configured for the client.
- The client has not been pushed to its own GitHub repo yet, so its CI workflow has not run on GitHub.

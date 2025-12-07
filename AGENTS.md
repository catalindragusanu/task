# Repository Guidelines

## Project Structure & Modules
- Root: `frontend/` (React app) and `backend/` (Flask API); shared docs in `README.md`, `CLAUDE.md`, and this file.
- Frontend: components/hooks/services/utils/styles in `frontend/src/`; assets in `frontend/public/`.
- Backend: Flask app factory in `backend/app/__init__.py`, routes in `backend/app/routes/`, services (OpenAI integration) in `backend/app/services/`, configuration in `backend/app/config.py`.
- Environment templates: `backend/.env.example`. Keep secrets out of git.

## Build, Test, and Development Commands
- Frontend setup: `cd frontend && npm install`.
- Frontend dev server: `npm start` (http://localhost:3000). Build: `npm run build`. Tests (Jest from CRA): `npm test`.
- Backend setup: `cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt && cp .env.example .env`.
- Backend run: `python run.py` (defaults http://localhost:5000). Set `OPENAI_API_KEY` in `.env` before AI routes.

## Coding Style & Naming
- JavaScript/React: Prefer functional components, hooks, and camelCase for variables/functions; PascalCase for components. Keep stateful logic in hooks/services where possible. CSS lives in `frontend/src/styles/App.css`; co-locate new styles when scoped.
- Python: PEP 8 (4-space indent), snake_case for functions/variables, PascalCase for classes. Keep API logic thin in `routes/`, heavier logic in `services/`.
- Imports: use relative paths inside each package (`./components/...`, `app.services...`).

## Testing Guidelines
- Frontend: `npm test` runs CRA Jest suite; add component tests near `frontend/src/__tests__/` or co-locate with components using `.test.jsx`. Mock network calls (`apiService`) where needed.
- Backend: No automated tests yet; add pytest under `backend/tests/` with virtualenv active. Aim to cover routes and service logic (OpenAI calls can be mocked).

## Commit & Pull Request Guidelines
- Commits: Use short, imperative messages (e.g., `Add daily planner layout`, `Fix brainstorm route error handling`). Group related changes; avoid committing secrets or `node_modules/`.
- Branches: Prefer descriptive names like `feature/daily-planner-ui`, `bugfix/brainstorm-500`, `chore/deps-upgrade`.
- PRs: Include summary, screenshots for UI changes, steps to reproduce/fix, and testing notes (`npm test`, `python run.py smoke`). Link issues if applicable. Ensure `.env` values are never shown in diffs.

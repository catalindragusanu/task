# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Task Manager web application with AI-powered brainstorming and daily planning features.

**Tech Stack:**
- Frontend: React 18 with localStorage persistence
- Backend: Python Flask with Ollama (llama3.2) integration
- No database required (localStorage only)
- AI: Local Ollama for privacy and zero API costs

## Development Commands

### Initial Setup
```bash
# 1. Install Ollama (if not installed)
# macOS: brew install ollama
# Or download from: https://ollama.ai

# 2. Start Ollama and pull model
ollama serve  # In one terminal
ollama pull llama3.2  # In another terminal

# 3. Backend setup
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# No API key needed - using local Ollama

# 4. Frontend setup (in new terminal)
cd frontend
npm install
```

### Running the Application
```bash
# Terminal 1 - Ollama (must be running)
ollama serve               # Runs on http://localhost:11434

# Terminal 2 - Backend
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python3 run.py             # Runs on http://localhost:5001

# Terminal 3 - Frontend
cd frontend
npm start                  # Runs on http://localhost:3000
```

**Important:** Backend runs on port 5001 (not 5000) to avoid conflicts with macOS AirPlay.

### Building for Production
```bash
cd frontend
npm run build              # Creates optimized build in frontend/build/
```

## Architecture

### High-Level Data Flow
1. **Task CRUD**: Frontend → localStorage (no backend)
2. **AI Features**: Frontend → Flask API → Ollama (local) → Flask → Frontend
3. **State Management**: Custom React hooks (useTasks, useCategories) manage localStorage state

**Key Design Choice:** Ollama runs locally, meaning AI features work offline with no API costs or data leaving your machine.

### Frontend Architecture

**State Management Pattern:**
- `useTasks()` and `useCategories()` hooks wrap localStorage operations
- App.jsx holds global state from hooks and passes down via props
- View routing handled by simple state (`currentView`) in App.jsx
- No React Router - single-page switching via conditional rendering

**Component Hierarchy:**
```
App.jsx (manages global state + view routing)
├─ Navbar (view switcher)
└─ renderView() returns one of:
   ├─ TaskList (default view)
   │  ├─ TaskForm (inline create)
   │  ├─ CategoryFilter
   │  └─ TaskItem[] (editable inline)
   ├─ DailyPlanner (AI plan generation)
   ├─ Brainstorming (AI task suggestions)
   └─ Calendar (react-calendar integration)
```

**Service Layer Pattern:**
- `storageService.js`: Pure localStorage operations with default categories
- `apiService.js`: Axios wrapper for Flask endpoints (POST only)
- Both services are imported directly by hooks/components (no context/provider)

### Backend Architecture

**Flask Factory Pattern:**
- `run.py` calls `create_app()` from `app/__init__.py`
- Configuration loaded via `app/config.py` (environment-based)
- Blueprint registration: `app/routes/brainstorm.py` → `/api/brainstorm` and `/api/generate-plan`

**AI Service Pattern:**
- `ai_service.py` makes HTTP requests to Ollama's REST API
- Uses llama3.2 model (configurable via OLLAMA_MODEL env var)
- Error handling includes JSON parsing from markdown code blocks (LLMs often wrap responses in ```)

**API Endpoints:**
- `POST /api/brainstorm` - Generates 5-7 task suggestions from context
- `POST /api/generate-plan` - Optimizes task order for daily planning
- `GET /` and `GET /api/health` - Health checks

## Task Data Model

```javascript
{
  id: timestamp,              // Generated client-side
  title: string,              // Required
  description: string,        // Optional
  category: string,           // From categories array
  priority: 'high' | 'medium' | 'low',
  status: 'todo' | 'in-progress' | 'done',
  dueDate: 'YYYY-MM-DD',     // ISO date string
  createdAt: ISO timestamp    // Set on creation
}
```

**Storage Keys:**
- `taskManager_tasks` - Task array
- `taskManager_categories` - String array (defaults: Work, Personal, Shopping, Health)

## Key Implementation Details

### Adding New Components
Components receive state/callbacks via props (no context). Follow this pattern:
```javascript
// In App.jsx
import NewComponent from './components/NewComponent';

// Add to renderView() switch statement
case 'newview':
  return <NewComponent tasks={tasks} onAddTask={addTask} />;
```

### Adding New API Endpoints
1. Add route handler in `backend/app/routes/brainstorm.py` (or create new blueprint)
2. Register blueprint in `backend/app/__init__.py`
3. Add corresponding function in `frontend/src/services/apiService.js`
4. Call from component using try/catch for error handling

### Modifying AI Prompts
Edit prompt builders in `backend/app/services/ai_service.py`:
- `_build_brainstorm_prompt()` - Task suggestion generation
- `_build_daily_plan_prompt()` - Daily plan optimization

Both methods expect JSON responses. Parser handles markdown code block extraction.

## Environment Variables

**Backend** (`backend/.env`):
```
OLLAMA_URL=http://localhost:11434    # Ollama API endpoint
OLLAMA_MODEL=llama3.2:latest         # Model to use (llama3.2, mistral, etc.)
FLASK_ENV=development                # Optional: development|production
FLASK_DEBUG=True                     # Optional: enables auto-reload
PORT=5001                            # Required on macOS (5000 conflicts with AirPlay)
```

**Available Ollama Models:**
- `llama3.2:latest` (current) - Fast, good quality
- `mistral` - Very capable, fast
- `qwen3-coder:30b` - Better for technical tasks (larger)

**Frontend** (`frontend/.env`):
```
REACT_APP_API_URL=http://localhost:5001/api  # Backend API URL
```

## Styling & Theme

**Current Color Palette:**
- Background: `#000000` (Black)
- Primary: `#9929EA` (Purple)
- Secondary: `#CC66DA` (Light Purple/Pink)
- Accent: `#FAEB92` (Light Yellow)

Dark theme applied throughout with purple accents. Calendar requires `!important` flags to override react-calendar defaults.

## Troubleshooting

**AI endpoints return 500:**
- Verify Ollama is running: `ollama serve`
- Check model is pulled: `ollama list`
- Pull model if needed: `ollama pull llama3.2`
- Check backend console for detailed error messages

**Ollama connection errors:**
- Ensure Ollama is running on port 11434
- Test: `curl http://localhost:11434/api/tags`
- Check `OLLAMA_URL` in `backend/.env`

**Port conflicts (macOS):**
- Backend uses port 5001 (not 5000) due to AirPlay
- If changing port, update both `backend/.env` and `frontend/.env`

**CORS errors:**
- Ensure backend is running before frontend
- Default CORS allows `http://localhost:3000`
- Modify `CORS_ORIGINS` in `backend/app/config.py` for other origins

**Tasks not persisting:**
- localStorage has ~5-10MB limit
- Check browser console for quota exceeded errors
- Verify `storageService.getTasks()` returns array (handles corrupted data)

**Calendar styling issues:**
- Calendar CSS requires `!important` flags to override react-calendar
- Ensure `react-calendar/dist/Calendar.css` is imported before custom styles

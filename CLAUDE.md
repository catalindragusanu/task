# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A task manager web application with AI-powered features including task brainstorming, daily plan generation with hourly scheduling, and task management. The app uses **Ollama (local AI)** instead of cloud-based AI services for privacy and zero API costs.

## Running the Application

### Quick Start (Recommended)

Use the automated startup script to run all services:

```bash
./start.sh
```

This script automatically starts:
- Ollama AI service (port 11434)
- Backend API (port 4001)
- Frontend (port 4000)

Press `Ctrl+C` to stop all services. Logs are saved in the `logs/` directory.

### Manual Start

#### Backend (Flask API - Port 4001)

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python run.py
```

#### Frontend (React - Port 4000)

```bash
cd frontend
npm start
```

#### Ollama (AI Service)

Ollama must be running for AI features to work:

```bash
ollama serve
```

The application uses the **llama3.2:latest** model by default. Verify Ollama is running:

```bash
ollama list  # Check installed models
curl http://localhost:11434/api/tags  # Verify server is running
```

## Architecture

### AI Integration - Ollama (NOT OpenAI)

- **Backend uses Ollama REST API** at `http://localhost:11434`
- AI service located in `backend/app/services/ai_service.py`
- Makes HTTP POST requests to `/api/generate` endpoint
- Configuration in `backend/.env`: `OLLAMA_URL` and `OLLAMA_MODEL`
- **Do NOT use OpenAI SDK** - the project was migrated from OpenAI to Ollama

### Data Persistence

- **No database** - uses browser localStorage for client-side persistence
- All task data stored in user's browser
- Storage service: `frontend/src/services/storageService.js`
- Tasks are never sent to backend except for AI operations (brainstorming/planning)

### Frontend State Management

- Custom React hook `useTasks` manages all task state
- Located in `frontend/src/hooks/useTasks.js`
- Provides CRUD operations: addTask, updateTask, deleteTask
- Automatically syncs with localStorage on every change

### Component Architecture

Main views managed by `App.jsx` with view state:
- **TaskList**: Main task management with reschedule feature
- **Calendar**: Calendar view with date-based task display (uses react-calendar)
- **DailyPlanner**: AI-generated hourly schedules with subtasks
- **Brainstorming**: AI-powered task suggestions

### Notification System

- Web Audio API for sound notifications
- Browser Notification API for desktop alerts
- Service: `frontend/src/utils/notificationService.js`
- Checks every 15 minutes for due tasks
- Toggle via bell icon in navbar

## Daily Planner AI Prompts

The AI generates plans with:
- **Hourly scheduling** (8:00 AM - 6:00 PM format)
- **3-5 subtasks** per task (actionable steps)
- Start time, end time, and duration estimates
- Reasoning for task prioritization

When modifying AI prompts in `backend/app/services/ai_service.py`:
- Ensure JSON structure includes: `startTime`, `endTime`, `subtasks[]`
- Use `_build_daily_plan_prompt()` for daily planning
- Use `_build_brainstorm_prompt()` for task suggestions

## Styling and Color Palette

**Primary colors (DO NOT CHANGE without user approval):**
- Background: `#000000` (black)
- Primary accent: `#9929EA` (purple)
- Secondary accent: `#CC66DA` (light purple/pink)
- Highlight: `#FAEB92` (yellow)

**Styling approach:**
- Dark theme throughout
- Main styles in `frontend/src/styles/App.css`
- Uses `!important` flags to override react-calendar default styles
- Purple and yellow color scheme for all interactive elements

## Key Features Implementation

### Task Rescheduling (TaskList)
- Selection mode toggle with checkboxes
- Multi-select tasks for batch rescheduling
- Date picker modal for new due date

### Daily Planner Task Export
- Checkboxes to select generated tasks
- "Add Selected to Calendar" creates actual tasks
- Tasks include scheduled times and subtasks in description

### Hourly Schedule Display
- Grid layout: checkbox | time | task details
- Timeline-style with start-end times
- Purple borders, yellow accents on hover

## API Endpoints

Backend provides two main AI endpoints:

**POST `/api/brainstorm`**
- Input: `{ context, taskType }`
- Returns AI-generated task suggestions

**POST `/api/generate-plan`**
- Input: `{ tasks[] }`
- Returns optimized daily schedule with hourly slots and subtasks

## Configuration Files

- `backend/.env` - Ollama URL, model name, Flask port (4001)
- `frontend/.env` (copy from `.env.example`) - Frontend port (4000) and API URL (http://localhost:4001/api)
- `frontend/src/services/apiService.js` - API base URL (`http://localhost:4001`)
- `frontend/package.json` - React dependencies and scripts
- `start.sh` - Automated startup script for all services

## Troubleshooting

**Ports already in use:**
- Frontend runs on port 4000
- Backend runs on port 4001
- Use `./start.sh` which automatically handles port conflicts

**Ollama not responding:**
- Check `ollama serve` is running
- Verify model installed: `ollama pull llama3.2`
- Check `/api/health` endpoint for Ollama status

**Start script fails:**
- Ensure backend venv exists: `cd backend && python3 -m venv venv`
- Install backend deps: `source venv/bin/activate && pip install -r requirements.txt`
- Install frontend deps: `cd frontend && npm install`

**Calendar styling issues:** Override with `!important` flags in CSS (react-calendar has strong defaults)

**Tasks not persisting:** Check browser localStorage - tasks only stored client-side

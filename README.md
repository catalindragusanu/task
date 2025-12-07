# Task Manager

A modern web application for managing tasks with AI-powered brainstorming and daily planning features.

## Features

- **Task Management**: Create, edit, delete, and organize tasks with categories
- **AI Brainstorming**: Generate task ideas based on your goals using AI
- **Daily Planning**: Get AI-optimized daily schedules based on task priorities
- **Calendar View**: Visual calendar showing tasks by date
- **Smart Filtering**: Filter by category, search, and sort by various criteria
- **Priority Levels**: High, Medium, Low priority classification
- **Status Tracking**: Todo, In Progress, Done status for each task
- **Local Storage**: All data persisted in browser (no account required)

## Tech Stack

### Frontend
- **React** - UI framework
- **LocalStorage** - Client-side data persistence
- **Axios** - HTTP client
- **date-fns** - Date utilities
- **react-calendar** - Calendar component

### Backend
- **Flask** - Python web framework
- **OpenAI API** - GPT-3.5-turbo for AI features
- **Flask-CORS** - Cross-origin resource sharing

## Quick Start

### Prerequisites

- Node.js 14+ and npm
- Python 3.8+
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd task-manager
```

2. **Set up the backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

3. **Set up the frontend**
```bash
cd ../frontend
npm install
```

### Running the Application

1. **Start the backend** (in the `backend` directory):
```bash
python run.py
```
Backend will run on `http://localhost:5000`

2. **Start the frontend** (in the `frontend` directory):
```bash
npm start
```
Frontend will open at `http://localhost:3000`

## Project Structure

```
task-manager/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── services/         # API and storage services
│   │   ├── hooks/            # Custom React hooks
│   │   ├── utils/            # Utility functions
│   │   └── styles/           # CSS styles
│   └── package.json
│
├── backend/                  # Flask API
│   ├── app/
│   │   ├── routes/           # API endpoints
│   │   ├── services/         # Business logic (AI service)
│   │   └── config.py         # Configuration
│   ├── requirements.txt
│   └── run.py
│
├── CLAUDE.md                 # Claude Code guidance
└── README.md                 # This file
```

## Usage Guide

### Creating Tasks

1. Click "New Task" button
2. Fill in task details:
   - Title (required)
   - Description (optional)
   - Category
   - Priority (Low/Medium/High)
   - Due Date
3. Click "Create Task"

### AI Brainstorming

1. Navigate to "Brainstorm" tab
2. Enter your goal or context (e.g., "I want to start a fitness routine")
3. Select task type
4. Click "Generate Ideas"
5. Review AI-generated task suggestions
6. Click "+ Add to Tasks" on any suggestion to add it to your task list

### Daily Planning

1. Navigate to "Daily Planner" tab
2. Click "Generate AI Plan"
3. AI will analyze your tasks and create an optimized daily schedule
4. View prioritized tasks with reasoning and time estimates

### Calendar View

1. Navigate to "Calendar" tab
2. Click on any date to view tasks scheduled for that day
3. Mark tasks as complete directly from the calendar

## API Documentation

### Brainstorming Endpoint
```
POST /api/brainstorm
Content-Type: application/json

{
  "context": "I want to learn web development",
  "taskType": "general"
}
```

### Daily Plan Endpoint
```
POST /api/generate-plan
Content-Type: application/json

{
  "tasks": [
    {
      "title": "Complete project",
      "priority": "high",
      "dueDate": "2024-12-10"
    }
  ]
}
```

See [backend/README.md](backend/README.md) for full API documentation.

## Configuration

### Environment Variables

**Backend** (`.env` in `backend/`):
```
OPENAI_API_KEY=your_api_key_here
FLASK_ENV=development
FLASK_DEBUG=True
```

**Frontend** (optional `.env` in `frontend/`):
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Development

### Adding New Features

1. **Frontend**: Add components in `frontend/src/components/`
2. **Backend**: Add routes in `backend/app/routes/`
3. **Services**: Add business logic in `backend/app/services/`

### Code Organization

- **Components**: Reusable UI components
- **Hooks**: Custom React hooks for state management
- **Services**: API calls and data persistence
- **Utils**: Helper functions

## Troubleshooting

### Backend Issues

**"OPENAI_API_KEY environment variable is not set"**
- Ensure `.env` file exists in `backend/` directory
- Verify `OPENAI_API_KEY` is set correctly
- Restart the Flask server

**Port 5000 already in use**
- Change port in `backend/.env`: `PORT=5001`
- Update frontend API URL accordingly

### Frontend Issues

**AI features not working**
- Ensure backend is running on port 5000
- Check browser console for errors
- Verify CORS is enabled in backend

**Tasks not saving**
- Check if browser allows localStorage
- Verify localStorage isn't full
- Check browser console for errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues and questions:
- Check the [frontend README](frontend/README.md)
- Check the [backend README](backend/README.md)
- Review the troubleshooting section above

## Future Enhancements

- User authentication and cloud sync
- Task sharing and collaboration
- Recurring tasks
- Task dependencies
- Analytics and productivity insights
- Mobile app
- Export to various formats (CSV, PDF)

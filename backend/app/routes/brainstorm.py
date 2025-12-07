from flask import Blueprint, request, jsonify, current_app
from app.services.ai_service import AIService

bp = Blueprint('brainstorm', __name__, url_prefix='/api')


@bp.route('/brainstorm', methods=['POST'])
def brainstorm():
    """
    Generate AI-powered task suggestions

    Request JSON:
    {
        "context": "User's goal or context",
        "taskType": "general|project|creative|research|business"
    }

    Response JSON:
    {
        "suggestions": [
            {
                "title": "Task title",
                "description": "Task description",
                "priority": "high|medium|low"
            }
        ]
    }
    """
    try:
        data = request.get_json()

        if not data or 'context' not in data:
            return jsonify({
                'error': 'Missing required field: context'
            }), 400

        context = data.get('context', '').strip()
        task_type = data.get('taskType', 'general')

        if not context:
            return jsonify({
                'error': 'Context cannot be empty'
            }), 400

        # Generate suggestions using AI service (Ollama)
        ai_service = AIService()
        suggestions = ai_service.generate_brainstorm(context, task_type)

        return jsonify({
            'suggestions': suggestions
        }), 200

    except ValueError as e:
        return jsonify({
            'error': str(e)
        }), 500

    except Exception as e:
        print(f"Error in brainstorm endpoint: {str(e)}")
        return jsonify({
            'error': 'An error occurred while generating suggestions. Please try again.'
        }), 500


@bp.route('/generate-plan', methods=['POST'])
def generate_plan():
    """
    Generate an optimized daily plan from tasks

    Request JSON:
    {
        "tasks": [
            {
                "id": 123,
                "title": "Task title",
                "priority": "high|medium|low",
                "dueDate": "2024-01-01",
                "category": "Work"
            }
        ]
    }

    Response JSON:
    {
        "suggestion": "Overall plan description",
        "tasks": [
            {
                "title": "Task title",
                "reason": "Why this task is prioritized here",
                "timeEstimate": "30 minutes"
            }
        ]
    }
    """
    try:
        data = request.get_json()

        if not data or 'tasks' not in data:
            return jsonify({
                'error': 'Missing required field: tasks'
            }), 400

        tasks = data.get('tasks', [])

        if not isinstance(tasks, list):
            return jsonify({
                'error': 'Tasks must be an array'
            }), 400

        # Generate daily plan using AI service (Ollama)
        ai_service = AIService()
        plan = ai_service.generate_daily_plan(tasks)

        return jsonify(plan), 200

    except ValueError as e:
        return jsonify({
            'error': str(e)
        }), 500

    except Exception as e:
        print(f"Error in generate-plan endpoint: {str(e)}")
        return jsonify({
            'error': 'An error occurred while generating the daily plan. Please try again.'
        }), 500

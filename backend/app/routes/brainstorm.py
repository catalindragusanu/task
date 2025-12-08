import logging
from flask import Blueprint, request, jsonify, current_app
from werkzeug.exceptions import BadRequest
from app.services.ai_service import AIService
from app.extensions import limiter

bp = Blueprint('brainstorm', __name__, url_prefix='/api')


logger = logging.getLogger(__name__)


def _validate_brainstorm_payload(data: dict):
    if not data or 'context' not in data:
        raise BadRequest('Missing required field: context')

    context = data.get('context', '')
    if not isinstance(context, str):
        raise BadRequest('Context must be a string')
    context = context.strip()
    if not context:
        raise BadRequest('Context cannot be empty')
    if len(context) > 500:
        raise BadRequest('Context is too long (500 char max)')

    task_type = data.get('taskType', 'general')
    allowed_types = {'general', 'project', 'creative', 'research', 'business'}
    if task_type not in allowed_types:
        raise BadRequest('Invalid taskType')

    return context, task_type


def _validate_plan_payload(data: dict):
    if not data or 'tasks' not in data:
        raise BadRequest('Missing required field: tasks')

    tasks = data.get('tasks', [])
    if not isinstance(tasks, list):
        raise BadRequest('Tasks must be an array')
    if len(tasks) > 200:
        raise BadRequest('Too many tasks in payload (max 200)')

    sanitized = []
    for task in tasks:
        if not isinstance(task, dict):
            continue
        sanitized.append({
            'id': task.get('id'),
            'title': str(task.get('title', 'Untitled'))[:120],
            'priority': task.get('priority', 'medium'),
            'dueDate': task.get('dueDate'),
            'category': task.get('category')
        })
    return sanitized


@bp.route('/brainstorm', methods=['POST'])
@limiter.limit(lambda: current_app.config['AI_ROUTE_RATE_LIMIT'])
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
        data = request.get_json(silent=True) or {}
        context, task_type = _validate_brainstorm_payload(data)

        # Generate suggestions using AI service (Ollama)
        ai_service = AIService()
        suggestions = ai_service.generate_brainstorm(context, task_type)

        return jsonify({
            'suggestions': suggestions
        }), 200

    except BadRequest as e:
        return jsonify({'error': str(e)}), 400
    except ValueError as e:
        logger.exception("ValueError in brainstorm endpoint")
        return jsonify({
            'error': str(e)
        }), 503

    except Exception as e:
        logger.exception("Error in brainstorm endpoint")
        return jsonify({
            'error': 'An error occurred while generating suggestions. Please try again.'
        }), 500


@bp.route('/generate-plan', methods=['POST'])
@limiter.limit(lambda: current_app.config['AI_ROUTE_RATE_LIMIT'])
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
        data = request.get_json(silent=True) or {}
        tasks = _validate_plan_payload(data)

        # Generate daily plan using AI service (Ollama)
        ai_service = AIService()
        plan = ai_service.generate_daily_plan(tasks)

        return jsonify(plan), 200

    except BadRequest as e:
        return jsonify({'error': str(e)}), 400
    except ValueError as e:
        logger.exception("ValueError in generate-plan endpoint")
        return jsonify({
            'error': str(e)
        }), 503

    except Exception as e:
        logger.exception("Error in generate-plan endpoint")
        return jsonify({
            'error': 'An error occurred while generating the daily plan. Please try again.'
        }), 500

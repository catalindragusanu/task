import os
import json
import logging
import requests

logger = logging.getLogger(__name__)


class AIService:
    """Service for AI-powered features using Ollama"""

    def __init__(self):
        self.base_url = os.getenv('OLLAMA_URL', 'http://localhost:11434')
        self.model = os.getenv('OLLAMA_MODEL', 'llama2')
        self.connect_timeout = float(os.getenv('OLLAMA_CONNECT_TIMEOUT', 5))
        self.read_timeout = float(os.getenv('OLLAMA_READ_TIMEOUT', 30))

        # Verify Ollama is running
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=2)
            if response.status_code != 200:
                logger.warning("Ollama may not be running", extra={"base_url": self.base_url})
        except requests.exceptions.RequestException:
            logger.warning("Could not connect to Ollama", extra={"base_url": self.base_url})

    def generate_brainstorm(self, context, task_type='general'):
        """
        Generate task suggestions based on user context

        Args:
            context (str): User's goal or context
            task_type (str): Type of tasks (general, project, creative, research, business)

        Returns:
            list: List of suggested tasks with title, description, and priority
        """
        self._check_ollama_available()
        system_prompt = "You are a helpful task planning assistant. Generate practical, actionable task suggestions in JSON format."
        user_prompt = self._build_brainstorm_prompt(context, task_type)

        full_prompt = f"{system_prompt}\n\n{user_prompt}"

        try:
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": full_prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "num_predict": 1000
                    }
                },
                timeout=(self.connect_timeout, self.read_timeout)
            )

            if response.status_code != 200:
                raise Exception(f"Ollama API returned status {response.status_code}")

            content = response.json()['response']
            suggestions = self._parse_json_response(content)

            return suggestions

        except requests.exceptions.ReadTimeout as e:
            logger.exception("Ollama timed out in generate_brainstorm")
            raise ValueError("Ollama timed out while generating suggestions. Is the model running?")
        except requests.exceptions.RequestException as e:
            logger.exception("Error connecting to Ollama")
            raise ValueError(f"Failed to connect to Ollama. Make sure it's running: {str(e)}")
        except Exception as e:
            logger.exception("Error in generate_brainstorm")
            raise Exception(f"Failed to generate brainstorming suggestions: {str(e)}")

    def generate_daily_plan(self, tasks):
        """
        Generate an optimized daily plan from tasks

        Args:
            tasks (list): List of task objects

        Returns:
            dict: Daily plan with prioritized tasks and suggestions
        """
        if not tasks:
            return {
                'suggestion': 'No tasks to plan. Add some tasks to get started!',
                'tasks': []
            }

        self._check_ollama_available()
        system_prompt = "You are a productivity coach. Create optimized daily plans that prioritize tasks effectively based on urgency, importance, and effort."
        user_prompt = self._build_daily_plan_prompt(tasks)

        full_prompt = f"{system_prompt}\n\n{user_prompt}"

        try:
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": full_prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.5,
                        "num_predict": 1500
                    }
                },
                timeout=(self.connect_timeout, self.read_timeout)
            )

            if response.status_code != 200:
                raise Exception(f"Ollama API returned status {response.status_code}")

            content = response.json()['response']
            plan = self._parse_plan_response(content)

            return plan

        except requests.exceptions.ReadTimeout as e:
            logger.exception("Ollama timed out in generate_daily_plan")
            raise ValueError("Ollama timed out while generating the plan. Is the model running?")
        except requests.exceptions.RequestException as e:
            logger.exception("Error connecting to Ollama")
            raise ValueError(f"Failed to connect to Ollama. Make sure it's running: {str(e)}")
        except Exception as e:
            logger.exception("Error in generate_daily_plan")
            raise Exception(f"Failed to generate daily plan: {str(e)}")

    def _check_ollama_available(self):
        """Fast check to avoid long timeouts when Ollama is down"""
        try:
            resp = requests.get(f"{self.base_url}/api/tags", timeout=2)
            if resp.status_code != 200:
                raise ValueError("Ollama is not responding (non-200). Start ollama serve.")
        except requests.exceptions.RequestException as exc:
            raise ValueError(f"Ollama is not reachable: {exc}")

    def _build_brainstorm_prompt(self, context, task_type):
        """Build prompt for brainstorming"""
        return f"""Given this context: "{context}"

Generate 5-7 specific, actionable tasks for a {task_type} context.

Return ONLY a JSON array with this exact structure:
[
  {{
    "title": "Task title (concise, under 50 chars)",
    "description": "Brief description of what needs to be done",
    "priority": "high" | "medium" | "low"
  }}
]

Make tasks:
- Specific and actionable
- Varied in scope (some quick wins, some longer-term)
- Prioritized appropriately
- Relevant to the context"""

    def _build_daily_plan_prompt(self, tasks):
        """Build prompt for daily planning"""
        task_summaries = []
        for task in tasks:
            summary = f"- {task.get('title', 'Untitled')} "
            summary += f"[Priority: {task.get('priority', 'medium')}] "
            if task.get('dueDate'):
                summary += f"[Due: {task.get('dueDate')}] "
            if task.get('category'):
                summary += f"[Category: {task.get('category')}]"
            task_summaries.append(summary)

        tasks_text = "\n".join(task_summaries)

        return f"""Given these tasks:

{tasks_text}

Create an optimized daily plan with hourly scheduling. Consider:
1. Priority levels (high priority first)
2. Due dates (urgent tasks first)
3. Task complexity (mix hard and easy tasks)
4. Energy levels throughout the day (harder tasks in morning, easier in afternoon)
5. Schedule tasks between 8:00 AM and 6:00 PM

Return ONLY a JSON object with this exact structure:
{{
  "suggestion": "Brief overview of the plan strategy (2-3 sentences)",
  "tasks": [
    {{
      "title": "Task title from the list",
      "reason": "Why this task is prioritized here",
      "timeEstimate": "Estimated time (e.g., '30 minutes', '2 hours')",
      "startTime": "HH:MM format (e.g., '09:00')",
      "endTime": "HH:MM format (e.g., '10:30')",
      "subtasks": [
        "First actionable step",
        "Second actionable step",
        "Third actionable step"
      ]
    }}
  ]
}}

For each task, include 3-5 specific subtasks that break down the work into smaller, actionable steps.
Order tasks from first to last to complete today. Ensure times don't overlap and include breaks."""

    def _parse_json_response(self, content):
        """Parse JSON response from OpenAI, handling markdown code blocks"""
        try:
            # Remove markdown code blocks if present
            content = content.strip()
            if content.startswith('```'):
                # Extract JSON from code block
                lines = content.split('\n')
                content = '\n'.join(lines[1:-1])  # Remove first and last lines

            data = json.loads(content)
            return data if isinstance(data, list) else []
        except json.JSONDecodeError:
            # Fallback: try to extract JSON from the response
            import re
            json_match = re.search(r'\[.*\]', content, re.DOTALL)
            if json_match:
                try:
                    return json.loads(json_match.group())
                except:
                    pass
            return []

    def _parse_plan_response(self, content):
        """Parse daily plan JSON response"""
        try:
            # Remove markdown code blocks if present
            content = content.strip()
            if content.startswith('```'):
                lines = content.split('\n')
                content = '\n'.join(lines[1:-1])

            data = json.loads(content)
            return data
        except json.JSONDecodeError:
            # Fallback: try to extract JSON from the response
            import re
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                try:
                    return json.loads(json_match.group())
                except:
                    pass
            return {
                'suggestion': 'Unable to generate plan',
                'tasks': []
            }

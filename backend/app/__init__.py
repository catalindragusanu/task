from flask import Flask
from flask_cors import CORS
from app.config import get_config


def create_app():
    """Application factory pattern"""
    app = Flask(__name__)

    # Load configuration
    config = get_config()
    app.config.from_object(config)

    # Enable CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": app.config['CORS_ORIGINS'],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type"]
        }
    })

    # Register blueprints
    from app.routes.brainstorm import bp as brainstorm_bp
    app.register_blueprint(brainstorm_bp)

    # Health check endpoint
    @app.route('/')
    def health_check():
        return {
            'status': 'healthy',
            'service': 'Task Manager API',
            'version': '1.0.0'
        }

    @app.route('/api/health')
    def api_health():
        import requests
        ollama_running = False
        try:
            response = requests.get(f"{app.config['OLLAMA_URL']}/api/tags", timeout=2)
            ollama_running = response.status_code == 200
        except:
            pass

        return {
            'status': 'healthy',
            'ollama_url': app.config.get('OLLAMA_URL'),
            'ollama_model': app.config.get('OLLAMA_MODEL'),
            'ollama_running': ollama_running
        }

    return app

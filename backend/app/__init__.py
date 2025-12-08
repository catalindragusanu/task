import logging
from flask import Flask, abort, request
from flask_cors import CORS
from app.config import get_config
from app.extensions import limiter


def create_app():
    """Application factory pattern"""
    app = Flask(__name__)

    # Load configuration
    config = get_config()
    app.config.from_object(config)

    # Configure logging early to ensure all modules use the same logger
    logging.basicConfig(
        level=getattr(logging, app.config['LOG_LEVEL'].upper(), logging.INFO),
        format='%(asctime)s %(levelname)s %(name)s: %(message)s'
    )
    logger = logging.getLogger(__name__)
    logger.info("Starting Task Manager API", extra={"env": app.config.get('FLASK_ENV')})

    # Enable CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": app.config['CORS_ORIGINS'],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type"]
        }
    })

    # Rate limiter with sensible defaults
    limiter.default_limits = [app.config['DEFAULT_RATE_LIMIT']]
    limiter.init_app(app)

    # Simple API key gate (optional via env)
    @app.before_request
    def require_api_key():
        required_key = app.config.get('API_KEY')
        if not required_key:
            return
        if request.path.startswith('/api/health'):
            return
        if request.path.startswith('/api'):
            provided = request.headers.get('X-API-Key')
            if provided != required_key:
                abort(401, description="Unauthorized")

    @app.errorhandler(429)
    def handle_rate_limit(e):
        return {"error": "Too many requests, please slow down."}, 429

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

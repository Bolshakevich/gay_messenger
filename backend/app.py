import os

from flask import Flask

from extensions import db
from models import User
from routes.users import bp as users_bp


def create_app():
    app = Flask(__name__, instance_relative_config=True)
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    os.makedirs(app.instance_path, exist_ok=True)
    db_path = os.path.join(app.instance_path, "gay_messenger.db")
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"

    db.init_app(app)
    app.register_blueprint(users_bp)

    with app.app_context():
        db.create_all()

    @app.get("/")
    def home():
        return {"message": "Сервер гей мессенджера передает привет"}

    @app.get("/health")
    def health():
        return {"ok": True}

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)

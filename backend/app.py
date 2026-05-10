import os

from flask import Flask
from sqlalchemy import inspect, text

from auth.routes.auth_api import bp as auth_bp
from extensions import db
from models import User
from routes.users import bp as users_bp


def _ensure_users_password_column():
    inspector = inspect(db.engine)
    if not inspector.has_table("users"):
        return
    cols = {c["name"] for c in inspector.get_columns("users")}
    if "password" not in cols:
        with db.engine.connect() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN password VARCHAR(256)"))
            conn.commit()


def create_app():
    app = Flask(__name__, instance_relative_config=True)
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    os.makedirs(app.instance_path, exist_ok=True)
    db_path = os.path.join(app.instance_path, "gay_messenger.db")
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"

    db.init_app(app)
    app.register_blueprint(users_bp)
    app.register_blueprint(auth_bp)

    with app.app_context():
        db.create_all()
        _ensure_users_password_column()

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

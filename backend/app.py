import os
import sqlite3

from flask import Flask
from sqlalchemy import event, inspect, text
from sqlalchemy.engine import Engine

from auth.routes.auth_api import bp as auth_bp
from extensions import db
from models import Dialog, Message, User
from routes.chat import bp as chat_bp
from routes.users import bp as users_bp


@event.listens_for(Engine, "connect")
def _sqlite_enable_foreign_keys(dbapi_connection, _connection_record):
    if not isinstance(dbapi_connection, sqlite3.Connection):
        return
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


def _ensure_users_password_column():
    inspector = inspect(db.engine)
    if not inspector.has_table("users"):
        return
    cols = {c["name"] for c in inspector.get_columns("users")}
    if "password" not in cols:
        with db.engine.connect() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN password VARCHAR(256)"))
            conn.commit()


def _migrate_dialogs_user_pair_columns():
    """Старые БД: user_send_id/user_get_id → user_1_id/user_2_id, всегда user_1 < user_2, без дубликатов пар."""
    inspector = inspect(db.engine)
    if not inspector.has_table("dialogs"):
        return
    cols = {c["name"] for c in inspector.get_columns("dialogs")}
    with db.engine.connect() as conn:
        if "user_send_id" in cols:
            conn.execute(text("ALTER TABLE dialogs RENAME COLUMN user_send_id TO user_1_id"))
            conn.execute(text("ALTER TABLE dialogs RENAME COLUMN user_get_id TO user_2_id"))
            conn.commit()

        cols = {c["name"] for c in inspect(db.engine).get_columns("dialogs")}
        if "user_1_id" not in cols:
            return

        rows = conn.execute(text("SELECT id, user_1_id, user_2_id FROM dialogs")).all()
        for id_, a, b in rows:
            u1, u2 = (a, b) if a < b else (b, a)
            if u1 == u2:
                continue
            if a != u1 or b != u2:
                conn.execute(
                    text("UPDATE dialogs SET user_1_id = :u1, user_2_id = :u2 WHERE id = :id"),
                    {"u1": u1, "u2": u2, "id": id_},
                )
        conn.commit()

        rows = conn.execute(
            text("SELECT id, user_1_id, user_2_id FROM dialogs ORDER BY id ASC")
        ).all()
        seen: dict[tuple[int, int], int] = {}
        for id_, u1, u2 in rows:
            key = (u1, u2)
            if key not in seen:
                seen[key] = id_
                continue
            keeper = seen[key]
            conn.execute(
                text("UPDATE messages SET dialog_id = :k WHERE dialog_id = :d"),
                {"k": keeper, "d": id_},
            )
            conn.execute(text("DELETE FROM dialogs WHERE id = :id"), {"id": id_})
        conn.commit()

        conn.execute(
            text(
                "CREATE UNIQUE INDEX IF NOT EXISTS uq_dialog_user_pair "
                "ON dialogs (user_1_id, user_2_id)"
            )
        )
        conn.commit()


def create_app():
    app = Flask(__name__, instance_relative_config=True)
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    os.makedirs(app.instance_path, exist_ok=True)
    db_path = os.path.join(app.instance_path, "gay_messenger.db")
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"

    db.init_app(app)
    app.register_blueprint(users_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(auth_bp)

    with app.app_context():
        db.create_all()
        _ensure_users_password_column()
        _migrate_dialogs_user_pair_columns()

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

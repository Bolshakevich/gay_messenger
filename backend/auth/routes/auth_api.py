"""
Ручка «пароль по username» для локального прототипа.

ВАЖНО: пароль в открытом виде; в реальном сервисе так не делают.
"""

from flask import Blueprint, jsonify

from models import User

bp = Blueprint("auth", __name__, url_prefix="/auth")


@bp.get("/password/<username>")
def password_by_username(username):
    """Вернуть сохранённый пароль по username."""
    uname = (username or "").strip()
    if not uname:
        return jsonify({"error": "username пустой"}), 400

    user = User.query.filter_by(username=uname).first()
    if user is None:
        return jsonify({"error": "Пользователь не найден"}), 404

    return jsonify({"username": user.username, "password": user.password}), 200

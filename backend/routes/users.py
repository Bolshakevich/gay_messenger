from flask import Blueprint, jsonify, request
from sqlalchemy.exc import IntegrityError

from extensions import db
from models import User

bp = Blueprint("users", __name__, url_prefix="/users")


@bp.post("")
def create_user():
    data = request.get_json(silent=True)
    if not data or not isinstance(data, dict):
        return jsonify({"error": "Ожидается JSON-объект в теле запроса"}), 400

    username = (data.get("username") or "").strip()
    if not username:
        return jsonify({"error": "Поле username обязательно"}), 400

    display_name = data.get("display_name")
    if display_name is not None:
        display_name = str(display_name).strip() or None

    user = User(username=username, display_name=display_name)
    db.session.add(user)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Пользователь с таким username уже есть"}), 409

    return jsonify(user.to_dict()), 201


@bp.get("")
def list_users():
    users = User.query.order_by(User.id.asc()).all()
    return jsonify([u.to_dict() for u in users])


@bp.get("/<int:user_id>")
def get_user(user_id):
    user = db.session.get(User, user_id)
    if user is None:
        return jsonify({"error": "Пользователь не найден"}), 404
    return jsonify(user.to_dict())


@bp.patch("/<int:user_id>")
def update_user(user_id):
    user = db.session.get(User, user_id)
    if user is None:
        return jsonify({"error": "Пользователь не найден"}), 404

    data = request.get_json(silent=True)
    if not data or not isinstance(data, dict):
        return jsonify({"error": "Ожидается JSON-объект в теле запроса"}), 400

    if "username" in data:
        username = (data.get("username") or "").strip()
        if not username:
            return jsonify({"error": "username не может быть пустым"}), 400
        user.username = username

    if "display_name" in data:
        dn = data.get("display_name")
        user.display_name = None if dn is None else (str(dn).strip() or None)

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Пользователь с таким username уже есть"}), 409

    return jsonify(user.to_dict())


@bp.delete("/<int:user_id>")
def delete_user(user_id):
    user = db.session.get(User, user_id)
    if user is None:
        return jsonify({"error": "Пользователь не найден"}), 404

    db.session.delete(user)
    db.session.commit()
    return "", 204

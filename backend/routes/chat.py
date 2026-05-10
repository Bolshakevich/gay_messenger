from flask import Blueprint, jsonify, request

from extensions import db
from models import Dialog, Message, User

bp = Blueprint("chat", __name__)


def _canonical_pair(user_a_id: int, user_b_id: int) -> tuple[int, int]:
    if user_a_id < user_b_id:
        return user_a_id, user_b_id
    return user_b_id, user_a_id


def _get_or_create_dialog(user_a_id: int, user_b_id: int) -> Dialog:
    if user_a_id == user_b_id:
        raise ValueError("Один и тот же пользователь")

    u1, u2 = _canonical_pair(user_a_id, user_b_id)
    d = Dialog.query.filter_by(user_1_id=u1, user_2_id=u2).first()
    if d is not None:
        return d

    d = Dialog(user_1_id=u1, user_2_id=u2)
    db.session.add(d)
    db.session.flush()
    return d


@bp.post("/messages")
def create_message():
    """Создать сообщение между двумя пользователями; диалог создаётся при необходимости."""
    data = request.get_json(silent=True)
    if not data or not isinstance(data, dict):
        return jsonify({"error": "Ожидается JSON-объект в теле запроса"}), 400

    try:
        from_id = int(data["from_user_id"])
        to_id = int(data["to_user_id"])
    except (KeyError, TypeError, ValueError):
        return jsonify({"error": "Нужны целые from_user_id и to_user_id"}), 400

    text = data.get("message")
    if text is None or not str(text).strip():
        return jsonify({"error": "Поле message обязательно и не может быть пустым"}), 400
    text = str(text)

    if from_id == to_id:
        return jsonify({"error": "Нельзя отправить сообщение самому себе"}), 400

    if db.session.get(User, from_id) is None or db.session.get(User, to_id) is None:
        return jsonify({"error": "Один из пользователей не найден"}), 404

    dialog = _get_or_create_dialog(from_id, to_id)
    msg = Message(dialog_id=dialog.id, user_send_id=from_id, message=text)
    db.session.add(msg)
    db.session.commit()

    return jsonify({"dialog": dialog.to_dict(), "message": msg.to_dict()}), 201


@bp.get("/chat/<int:user_a>/<int:user_b>")
def get_chat(user_a: int, user_b: int):
    """Все сообщения между user_a и user_b по дате; диалог создаётся, если ещё не было переписки."""
    if user_a == user_b:
        return jsonify({"error": "Нужны два разных пользователя"}), 400

    if db.session.get(User, user_a) is None or db.session.get(User, user_b) is None:
        return jsonify({"error": "Один из пользователей не найден"}), 404

    dialog = _get_or_create_dialog(user_a, user_b)
    db.session.commit()

    rows = (
        Message.query.filter_by(dialog_id=dialog.id)
        .order_by(Message.sent_at.asc(), Message.id.asc())
        .all()
    )

    return jsonify({"dialog": dialog.to_dict(), "messages": [m.to_dict() for m in rows]}), 200

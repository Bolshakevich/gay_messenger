from datetime import datetime, timezone

from extensions import db


class User(db.Model):
    """Пользователь чата / мини-игр."""

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    display_name = db.Column(db.String(120), nullable=True)
    password = db.Column(db.String(256), nullable=True)
    created_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "display_name": self.display_name,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Dialog(db.Model):
    """Диалог между двумя пользователями: всегда user_1_id < user_2_id (одна пара — один ряд)."""

    __tablename__ = "dialogs"
    __table_args__ = (
        db.CheckConstraint("user_1_id < user_2_id", name="chk_dialog_ordered_users"),
        db.UniqueConstraint("user_1_id", "user_2_id", name="uq_dialog_user_pair"),
    )

    id = db.Column(db.Integer, primary_key=True)
    user_1_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    user_2_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)

    def to_dict(self):
        return {
            "id": self.id,
            "user_1_id": self.user_1_id,
            "user_2_id": self.user_2_id,
        }


class Message(db.Model):
    """Сообщение внутри диалога."""

    __tablename__ = "messages"

    id = db.Column(db.Integer, primary_key=True)
    dialog_id = db.Column(
        db.Integer,
        db.ForeignKey("dialogs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_send_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    message = db.Column(db.Text, nullable=False)
    # Дата отправки (в ТЗ поле называлось «data» — здесь явное имя колонки).
    sent_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def to_dict(self):
        return {
            "id": self.id,
            "dialog_id": self.dialog_id,
            "user_send_id": self.user_send_id,
            "message": self.message,
            "sent_at": self.sent_at.isoformat() if self.sent_at else None,
        }

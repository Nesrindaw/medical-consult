
import logging

logger = logging.getLogger(__name__)

def notify_user(user, message):
    """
    إرسال إشعار للمستخدم (مبدئياً فقط في الـ logs).
    مستقبلاً ممكن نطوره ليكون SMS أو إشعار داخل الواجهة.
    """
    if hasattr(user, "email") and user.email:
        logger.info(f"  Notification to {user.email}: {message}")
    else:
        logger.info(f" Notification to user {user}: {message}")

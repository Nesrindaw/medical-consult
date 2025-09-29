from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Consultation
from .utils.notify import notify_user
from .email_utils import send_consultation_emails


@receiver(post_save, sender=Consultation)
def consultation_created_or_updated(sender, instance, created, **kwargs):
    """
    Signal يشتغل عند إنشاء أو تحديث Consultation
    """
    if created:
        # أول مرة تنشأ استشارة
        notify_user(
            instance,
            f"استشارة جديدة تم تسجيلها للمريض {instance.patient_name}"
        )
        send_consultation_emails(instance, stage="created")

    else:
        # تحديث الاستشارة
        notify_user(
            instance,
            f"تم تحديث حالة الاستشارة {instance.id} إلى {instance.status}"
        )

        # حالة الدفع (فقط Admin أو Webhook من زين كاش)
        if instance.status.upper() == "PAID" and instance.paid:
            send_consultation_emails(instance, stage="paid")

        # حالة المراجعة (الدكتور فقط)
        elif instance.status.upper() == "REVIEWED":
            send_consultation_emails(instance, stage="reviewed")

from django.core.mail import send_mail
from django.conf import settings
from celery import shared_task


@shared_task
def send_email_async(subject, text, html, recipient):
    """Task لإرسال إيميل Async عبر Celery"""
    send_mail(
        subject,
        text,
        settings.DEFAULT_FROM_EMAIL,
        [recipient],
        fail_silently=True,
        html_message=html,
    )


def send_consultation_emails(consultation, stage="created"):
    subject_patient = ""
    text_patient = ""
    html_patient = ""

    subject_doctor = ""
    text_doctor = ""
    html_doctor = ""

    doctor_email = getattr(consultation.assigned_doctor, "email", "") or settings.DEFAULT_FROM_EMAIL

    if stage == "created":
        subject_patient = "تم استلام استشارتك"
        text_patient = (
            f"مرحباً {consultation.patient_name}\n\n"
            f"تم استلام استشارتك.\n"
            f"سيتواصل معك الطبيب قريباً.\n"
        )
        html_patient = f"""
            <p>مرحباً {consultation.patient_name}</p>
            <p>تم استلام استشارتك. سيتواصل معك الطبيب قريباً.</p>
        """

        subject_doctor = "استشارة جديدة"
        text_doctor = (
            f"استشارة جديدة من: {consultation.patient_name}\n"
            f"العمر: {consultation.patient_age}\n"
            f"البريد: {consultation.patient_email or 'غير مدخل'}\n"
            f"الهاتف: {consultation.patient_phone}\n"
        )
        html_doctor = f"""
            <p><strong>استشارة جديدة</strong></p>
            <ul>
              <li>الاسم: {consultation.patient_name}</li>
              <li>العمر: {consultation.patient_age}</li>
              <li>البريد: {consultation.patient_email or 'غير مدخل'}</li>
              <li>الهاتف: {consultation.patient_phone}</li>
            </ul>
        """

    elif stage == "paid":
        subject_patient = "تم تأكيد دفع الاستشارة"
        text_patient = (
            f"مرحباً {consultation.patient_name}\n\n"
            f"تم استلام دفعتك بنجاح. سيقوم الطبيب بمراجعتها.\n"
        )
        html_patient = f"""
            <p>مرحباً {consultation.patient_name}</p>
            <p>تم استلام دفعتك بنجاح. سيقوم الطبيب بمراجعتها.</p>
        """

        subject_doctor = "استشارة مدفوعة"
        text_doctor = f"تم دفع الاستشارة #{consultation.id} للمريض {consultation.patient_name}\n"
        html_doctor = f"""
            <p><strong>استشارة مدفوعة</strong></p>
            <p>رقم: {consultation.id} — المريض: {consultation.patient_name}</p>
        """

    elif stage == "reviewed":
        subject_patient = "تمت مراجعة استشارتك"
        text_patient = (
            f"مرحباً {consultation.patient_name}\n\n"
            f"لقد قام الطبيب بمراجعة استشارتك وسيتم التواصل معك قريباً.\n"
        )
        html_patient = f"""
            <p>مرحباً {consultation.patient_name}</p>
            <p>لقد قام الطبيب بمراجعة استشارتك وسيتم التواصل معك قريباً.</p>
        """

        subject_doctor = "تمت مراجعة استشارة"
        text_doctor = (
            f"الاستشارة #{consultation.id} للمريض {consultation.patient_name} "
            f"تمت مراجعتها وتغيير حالتها إلى REVIEWED.\n"
        )
        html_doctor = f"""
            <p><strong>تمت مراجعة استشارة</strong></p>
            <p>الاستشارة #{consultation.id} للمريض {consultation.patient_name} تمت مراجعتها.</p>
        """

    # للمريض
    if consultation.patient_email:
        try:
            send_email_async.delay(subject_patient, text_patient, html_patient, consultation.patient_email)
            patient_notice = "تم إرسال إشعار إلى بريدك الإلكتروني. سيتواصل معك الطبيب عبر الهاتف قريباً."
        except Exception:
            # fallback لو Celery مش شغال
            send_mail(
                subject_patient,
                text_patient,
                settings.DEFAULT_FROM_EMAIL,
                [consultation.patient_email],
                fail_silently=True,
                html_message=html_patient,
            )
            patient_notice = "تم إرسال إشعار (Sync)."
    else:
        patient_notice = "سيتواصل معك الطبيب عبر الهاتف قريباً."

    # للطبيب
    try:
        send_email_async.delay(subject_doctor, text_doctor, html_doctor, doctor_email)
    except Exception:
        send_mail(
            subject_doctor,
            text_doctor,
            settings.DEFAULT_FROM_EMAIL,
            [doctor_email],
            fail_silently=True,
            html_message=html_doctor,
        )

    return patient_notice

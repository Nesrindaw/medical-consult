from django.db import models
from django.contrib.auth.models import User 
from django.contrib.auth import get_user_model

class Doctor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="doctor_profile")
    specialty = models.CharField(max_length=120, blank=True)  
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.user.get_full_name() or self.user.username
    
class Consultation(models.Model):
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("PAID", "Paid"),
        ("REVIEWED", "Reviewed"),
    ]
    PAYMENT_METHODS = [
        ("NONE", "No Payment"),
        ("ZAINCASH", "ZainCash"),
    ]
    patient_name = models.CharField(max_length=120)
    patient_age = models.PositiveIntegerField()
    patient_email = models.EmailField()
    patient_phone = models.CharField(max_length=20)
    message = models.TextField()
    
    assigned_doctor = models.ForeignKey(
        Doctor, null=True, blank=True, on_delete=models.SET_NULL, related_name="consultations"
    )

    paid = models.BooleanField(default=False, editable=False)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, default="NONE", db_index=True)
    zaincash_transaction_id = models.CharField(max_length=255, null=True, blank=True, db_index=True)
    zaincash_invoice_url    = models.URLField(max_length=500, null=True, blank=True)

    
    created_at = models.DateTimeField(auto_now_add=True)  

    def __str__(self):
        return f"#{self.pk} {self.patient_name} - {self.status}"



class ConsultationFile(models.Model):
    consultation = models.ForeignKey(
        "Consultation",
        related_name="files",
        on_delete=models.CASCADE
    )
    file = models.FileField(upload_to="consultation_files/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"File for {self.consultation.patient_name}"
User = get_user_model()

class Notification(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notifications",
        null=True,       
        blank=True       
    )
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        if self.user:
            return f"Notification for {self.user}: {self.message[:30]}"
        return f"Notification (no user): {self.message[:30]}"

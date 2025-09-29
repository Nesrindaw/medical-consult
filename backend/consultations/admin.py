from django.contrib import admin
from .models import Doctor, Consultation, ConsultationFile, Notification


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "specialty")
    list_filter = ( "specialty",)
    search_fields = ("user__username", "user__email", "specialty")
    ordering = ("id",)


class ConsultationFileInline(admin.TabularInline):
    model = ConsultationFile
    extra = 0


@admin.register(Consultation)
class ConsultationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "patient_name",
        "patient_email",
        "assigned_doctor",
        "status",
        "paid",
        "payment_method",
        "created_at",
    )
    list_filter = ("status", "paid", "payment_method", "created_at")
    search_fields = ("patient_name", "patient_email", "assigned_doctor__user__username")
    ordering = ("-created_at",)
    inlines = [ConsultationFileInline]
    readonly_fields = ("created_at",)

    # الأدمن يقدر يغيّر Paid مباشرة من لوحة التحكم
    actions = ["mark_as_paid"]

    def mark_as_paid(self, request, queryset):
        updated = queryset.update(status="PAID", paid=True)
        self.message_user(request, f"{updated} consultations marked as Paid.")
    mark_as_paid.short_description = "Mark selected consultations as Paid"


@admin.register(ConsultationFile)
class ConsultationFileAdmin(admin.ModelAdmin):
    list_display = ("id", "consultation", "file")
    search_fields = ("consultation__patient_name",)
    ordering = ("id",)


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "message", "created_at")
    search_fields = ("message", "user__username", "user__email")
    ordering = ("-created_at",)

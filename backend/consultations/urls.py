from django.urls import path, include
from rest_framework.routers import DefaultRouter
from.zaincash_views import create_payment, zaincash_callback
from . import views
from .views import NotificationViewSet
from .views import (
    health,
    ConsultationViewSet,
    ConsultationFileViewSet,
    DoctorDashboardView,
    NotificationViewSet,
)

router = DefaultRouter()
router.register(r'consultations', ConsultationViewSet, basename='consultation')
router.register(r'consultationfiles', ConsultationFileViewSet, basename='consultationfile')
router.register(r'notifications', NotificationViewSet, basename="notification")


urlpatterns = [
    # API Router
    path('', include(router.urls)),

    # Health check
    path("health/", health, name="health"),

    # Doctor dashboard
    path("doctor/consultations/", DoctorDashboardView.as_view(), name="doctor-dashboard"),

    # Payments (ZainCash)
    path("payments/zaincash/create/", create_payment, name="zaincash_create"),
    path("payments/zaincash/callback/", zaincash_callback, name="zaincash_callback"),

    # Admin Endpoints
    # Doctors
    path("admin/doctors/", views.admin_doctors, name="admin_doctors"),
    path("admin/doctors/add/", views.admin_add_doctor, name="admin_add_doctor"),
    path("admin/doctors/<int:pk>/delete/", views.admin_delete_doctor, name="admin_delete_doctor"),
    # Consultations
    path("admin/consultations/", views.admin_consultations, name="admin_consultations"),
    path("admin/consultations/<int:pk>/delete/", views.admin_delete_consultation, name="admin_delete_consultation"),
    path("admin/consultations/<int:pk>/assign/", views.admin_assign_consultation, name="admin_assign_consultation"),
    path("admin/consultations/<int:pk>/status/", views.admin_update_consultation_status, name="admin_update_consultation_status"),

    # Noyifications
     path("notifications/", views.get_notifications, name="get_notifications"),
]

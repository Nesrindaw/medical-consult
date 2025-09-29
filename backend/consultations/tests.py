from django.test import TestCase

from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth.models import User
from .models import Consultation, Doctor


class ConsultationTests(APITestCase):
    def setUp(self):
        # مستخدم أدمن
        self.admin_user = User.objects.create_superuser(
            username="admin", email="admin@test.com", password="admin123"
        )

        # مستخدم دكتور
        self.doctor_user = User.objects.create_user(
            username="doctor", email="doctor@test.com", password="doctor123"
        )
        self.doctor_profile = Doctor.objects.create(user=self.doctor_user, specialty="General")

        # عميل API
        self.client = APIClient()

    def test_create_consultation_as_patient(self):
        """المريض ينشئ استشارة بدون تسجيل"""
        url = reverse("consultation-list")
        data = {
            "patient_name": "Ali",
            "patient_age": 30,
            "patient_email": "ali@test.com",
            "patient_phone": "0770000000",
            "message": "صداع شديد منذ يومين",
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("consultation_id", response.data)

    def test_doctor_can_list_assigned_consultations(self):
        """الدكتور يشوف فقط الاستشارات المعينة له"""
        cons = Consultation.objects.create(
            patient_name="Sara",
            patient_age=25,
            patient_email="sara@test.com",
            message="استشارة طبية",
            assigned_doctor=self.doctor_profile,
        )
        self.client.login(username="doctor", password="doctor123")
        url = reverse("doctor-dashboard")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], cons.id)

    def test_admin_can_mark_paid(self):
        """الأدمن يغير الحالة إلى Paid"""
        cons = Consultation.objects.create(
            patient_name="Omar",
            patient_age=40,
            patient_email="omar@test.com",
            message="حالة دفع",
        )
        self.client.login(username="admin", password="admin123")
        url = reverse("consultation-detail", args=[cons.id])
        data = {"status": "PAID", "paid": True}
        response = self.client.patch(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        cons.refresh_from_db()
        self.assertTrue(cons.paid)
        self.assertEqual(cons.status, "PAID")

    def test_doctor_can_mark_reviewed(self):
        """الدكتور يغير الحالة إلى Reviewed"""
        cons = Consultation.objects.create(
            patient_name="Layla",
            patient_age=29,
            patient_email="layla@test.com",
            message="تم دفعها",
            status="PAID",
            paid=True,
            assigned_doctor=self.doctor_profile,
        )
        self.client.login(username="doctor", password="doctor123")
        url = reverse("consultation-mark-reviewed", args=[cons.id])
        response = self.client.post(url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        cons.refresh_from_db()
        self.assertEqual(cons.status, "REVIEWED")

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from django.db import transaction
from django.conf import settings
from django.utils import timezone

from .models import Consultation, ConsultationFile, Notification
from .serializers import (
    DoctorSerializer,
    ConsultationSerializer,
    ConsultationFileSerializer,
    NotificationSerializer,
)
from .permissions import IsDoctor, IsAdmin
from .email_utils import send_consultation_emails

from .utils.validators import validate_uploaded_file  

import jwt


#  Health Check 
@api_view(["GET"])
def health(request):
    return Response({"status": "ok"})


# Consultation Files 
class ConsultationFileViewSet(viewsets.ModelViewSet):
    queryset = ConsultationFile.objects.all()
    serializer_class = ConsultationFileSerializer
    permission_classes = [IsAuthenticated]


# Consultations 
class ConsultationViewSet(viewsets.ModelViewSet):
    queryset = Consultation.objects.all().order_by("-created_at")
    serializer_class = ConsultationSerializer

    def get_permissions(self):
        if self.action == "create":
            return [AllowAny()]  # المريض يقدر ينشئ بدون تسجيل
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated()]  # الدكتور أو الأدمن
        if self.action in ["upload_file", "mark_reviewed"]:
            return [IsDoctor()]  # فقط الطبيب المعين
        if self.action in ["update", "partial_update"]:
            return [IsAdmin()]  # فقط الأدمن 
        return [IsAuthenticated()]

    def list(self, request, *args, **kwargs):
        """الأدمن يشوف الكل - الدكتور يشوف فقط استشاراته"""
        user = request.user
        if user.is_staff:
            qs = Consultation.objects.all().order_by("-created_at")
        elif hasattr(user, "doctor_profile"):
            qs = Consultation.objects.filter(
                assigned_doctor=user.doctor_profile
            ).order_by("-created_at")
        else:
            return Response({"detail": "Not allowed."}, status=403)

        page = self.paginate_queryset(qs)
        if page is not None:
            ser = self.get_serializer(page, many=True, context={"request": request})
            return self.get_paginated_response(ser.data)

        ser = self.get_serializer(qs, many=True, context={"request": request})
        return Response(ser.data)

    def create(self, request, *args, **kwargs):
        """المريض ينشئ استشارة Draft (PENDING, paid=False)"""
        data = {
            "patient_name": request.data.get("patient_name"),
            "patient_age": request.data.get("patient_age"),
            "patient_email": request.data.get("patient_email"),
            "patient_phone": request.data.get("patient_phone") or "",
            "message": request.data.get("message"),
        }

        required = ["patient_name", "patient_age", "message"]
        if any(not data[k] for k in required):
            return Response({"detail": "Missing required fields."}, status=400)

        try:
            with transaction.atomic():
                cons = Consultation.objects.create(
                    patient_name=data["patient_name"],
                    patient_age=data["patient_age"],
                    patient_email=data["patient_email"],
                    patient_phone=data["patient_phone"],
                    message=data["message"],
                    status="PENDING",
                    paid=False,
                    payment_method="NONE",
                )

                files = request.FILES.getlist("uploaded_files")
                for f in files:
                    validate_uploaded_file(f)
                    ConsultationFile.objects.create(consultation=cons, file=f)

                notice = send_consultation_emails(cons, stage="created")

                Notification.objects.create(
                    user=None,
                    message=f"تم تسجيل استشارة جديدة للمريض {cons.patient_name}"
                )

        except Exception as e:
            return Response({"detail": f"Consultation creation failed: {e}"}, status=400)

        return Response(
            {
                "consultation_id": cons.id,
                "detail": "تم تسجيل الاستشارة بنجاح.",
                "notice": notice,
            },
            status=201,
        )

    @action(detail=True, methods=["post"])
    def upload_file(self, request, pk=None):
        """الدكتور المعين فقط يرفع ملفات إضافية"""
        instance = self.get_object()
        user = request.user
        if not (hasattr(user, "doctor_profile") and instance.assigned_doctor_id == user.doctor_profile.id):
            return Response({"detail": "Not allowed."}, status=403)

        files = request.FILES.getlist("uploaded_files") or request.FILES.getlist("files")
        for f in files:
            try:
                #  تعديل: تحقق من نوع/حجم الملف
                validate_uploaded_file(f)  
                ConsultationFile.objects.create(consultation=instance, file=f)
                added += 1
            except Exception as e:
                return Response({"error": str(e)}, status=400)

        return Response({"added": len(files)})

    @action(detail=True, methods=["post"])
    def mark_reviewed(self, request, pk=None):
        """الدكتور المعين فقط يغير الحالة إلى REVIEWED"""
        cons = self.get_object()
        user = request.user

        if not (hasattr(user, "doctor_profile") and cons.assigned_doctor_id == user.doctor_profile.id):
            return Response({"detail": "Not allowed."}, status=403)

        if cons.status == "REVIEWED":
            return Response({"detail": "Already reviewed."}, status=200)

        old_status = cons.status
        cons.status = "REVIEWED"
        cons.save(update_fields=["status"])

        send_consultation_emails(cons, stage="reviewed")
        Notification.objects.create(
            user=user,
            message=f"تمت مراجعة الاستشارة #{cons.id} ({cons.patient_name})"
        )

        return Response(
            {"detail": "Marked as reviewed.", "id": cons.id, "old_status": old_status, "new_status": cons.status},
            status=200,
        )


# Doctor Dashboard 
class DoctorDashboardView(APIView):
    """GET /api/doctor/consultations/"""
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        if user.is_staff:
            qs = Consultation.objects.all().order_by("-created_at")
        elif hasattr(user, "doctor_profile"):
            qs = Consultation.objects.filter(
                assigned_doctor=user.doctor_profile
            ).order_by("-created_at")
        else:
            return Response({"detail": "Not allowed."}, status=403)

        ser = ConsultationSerializer(qs, many=True, context={"request": request})
        return Response(ser.data, status=200)


# Notifications 
class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by("-created_at")


# ZainCash Integration (Create Request)
@api_view(["POST"])
@permission_classes([AllowAny])
def zaincash_create(request):
    consultation_id = request.data.get("consultation_id")
    amount = request.data.get("amount")

    if not consultation_id or not amount:
        return Response({"error": "Missing consultation_id or amount"}, status=400)

    try:
        consultation = Consultation.objects.get(id=consultation_id)
    except Consultation.DoesNotExist:
        return Response({"error": "Consultation not found"}, status=404)

    merchant_id = getattr(settings, "ZAINCASH_MERCHANT_ID", None)
    secret = getattr(settings, "ZAINCASH_SECRET", None)
    redirect_url = getattr(settings, "ZAINCASH_REDIRECT_URL", None)
    test_mode = getattr(settings, "ZAINCASH_TEST", True)

    if not all([merchant_id, secret, redirect_url]):
        return Response({"error": "Missing ZainCash configuration"}, status=500)

    payload = {
        "amount": int(amount),
        "serviceType": "Medical Consultation",
        "msisdn": consultation.patient_phone or "07700000000",
        "orderId": str(consultation.id),
        "redirectUrl": redirect_url,
        "iat": int(timezone.now().timestamp())
    }

    try:
        token = jwt.encode(payload, secret, algorithm="HS256")
        if isinstance(token, bytes):
            token = token.decode("utf-8")
    except Exception as e:
        return Response({"error": f"JWT generation failed: {str(e)}"}, status=500)

    base_url = "https://test.zaincash.iq/transaction/pay" if test_mode else "https://zaincash.iq/transaction/pay"
    payment_url = f"{base_url}?id={token}"

    consultation.payment_method = "ZAINCASH"
    consultation.zaincash_invoice_url = payment_url
    consultation.save(update_fields=["payment_method", "zaincash_invoice_url"])

    return Response({
        "payment_url": payment_url,
        "transaction_id": token
    }, status=200)

from rest_framework import filters

class ConsultationViewSet(viewsets.ModelViewSet):
    filter_backends = [filters.SearchFilter]
    search_fields = ["patient_name", "patient_email", "message", "status"]

# Get all doctors (Admin only)
@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_doctors(request):
    doctors = Doctor.objects.all()
    serializer = DoctorSerializer(doctors, many=True)
    return Response(serializer.data)


# Get all consultations (Admin only)
@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_consultations(request):
    consultations = Consultation.objects.all().order_by("-created_at")
    serializer = ConsultationSerializer(consultations, many=True)
    return Response(serializer.data)


# Delete consultation (Admin only)
@api_view(["DELETE"])
@permission_classes([IsAdminUser])
def admin_delete_consultation(request, pk):
    try:
        consultation = Consultation.objects.get(pk=pk)
        consultation.delete()
        return Response({"message": "Consultation deleted"})
    except Consultation.DoesNotExist:
        return Response({"error": "Not found"}, status=404)
    
    # تعيين استشارة لطبيب معين
@api_view(["POST"])
@permission_classes([IsAdminUser])
def admin_assign_consultation(request, pk):
    try:
        consultation = Consultation.objects.get(pk=pk)
        doctor_id = request.data.get("doctor_id")
        doctor = Doctor.objects.get(pk=doctor_id)

        consultation.assigned_doctor = doctor
        consultation.save(update_fields=["assigned_doctor"])

        return Response({"message": f"Consultation {pk} assigned to {doctor.name}"})
    except Consultation.DoesNotExist:
        return Response({"error": "Consultation not found"}, status=404)
    except Doctor.DoesNotExist:
        return Response({"error": "Doctor not found"}, status=404)
    
    # تغيير حالة الاستشارة من قبل الأدمن
@api_view(["POST"])
@permission_classes([IsAdminUser])
def admin_update_consultation_status(request, pk):
    try:
        consultation = Consultation.objects.get(pk=pk)
        new_status = request.data.get("status")

        if new_status not in ["PENDING", "REVIEWED", "CLOSED"]:
            return Response({"error": "Invalid status"}, status=400)

        consultation.status = new_status
        consultation.save(update_fields=["status"])

        return Response({"message": f"Consultation {pk} status updated to {new_status}"})
    except Consultation.DoesNotExist:
        return Response({"error": "Consultation not found"}, status=404)
from .models import Notification
from .serializers import NotificationSerializer

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    """
    - إذا المستخدم دكتور: يرجع إشعارات مرتبطة به.
    - إذا Admin: يرجع كل الإشعارات.
    """
    user = request.user
    if user.is_staff:
        qs = Notification.objects.all().order_by("-created_at")
    else:
        qs = Notification.objects.filter(user=user).order_by("-created_at")

    serializer = NotificationSerializer(qs, many=True)
    return Response(serializer.data)

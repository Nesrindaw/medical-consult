from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Doctor, Consultation, ConsultationFile
from .models import Notification

class DoctorSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    name = serializers.CharField(source="user.get_full_name", read_only=True)

    class Meta:
        model = Doctor
        fields = ["id", "name", "email", "specialty"]

    def get_doctor_name(self, obj):
        return obj.user.get_full_name() or obj.user.username    

class ConsultationFileSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = ConsultationFile
        fields = ["id", "file", "file_url", "uploaded_at"]
        read_only_fields = ["id", "uploaded_at", "file_url"]

    def get_file_url(self, obj):
        req = self.context.get("request")
        return req.build_absolute_uri(obj.file.url) if req else obj.file.url

class ConsultationSerializer(serializers.ModelSerializer):
    files = ConsultationFileSerializer(source='consultationfile_set', many=True, read_only=True)
    assigned_doctor = DoctorSerializer(read_only=True)
    fields = "__all__"
    
    uploaded_files = serializers.ListField(
        child=serializers.FileField(max_length=100000, allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )
    class Meta:
        model = Consultation
        fields = [
            "id",
            "patient_name", "patient_age", "patient_email", "patient_phone",
            "message",
            "assigned_doctor",
            "status", "paid",
            "payment_method", "zaincash_transaction_id", "zaincash_invoice_url",
            "created_at",
            "files",
            "uploaded_files",
        ]
        read_only_fields = [
            "id", "assigned_doctor", "status", "paid",
            "zaincash_transaction_id", "zaincash_invoice_url",
            "created_at", "files"
        ]

    def create(self, validated_data):
        uploaded_files = validated_data.pop("uploaded_files", [])
        consultation = Consultation.objects.create(**validated_data)
        for file in uploaded_files:
          ConsultationFile.objects.create(consultation=consultation, file=file)

        return consultation


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "message", "created_at", "is_read"]
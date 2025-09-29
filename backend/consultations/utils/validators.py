import os
from django.core.exceptions import ValidationError

def validate_uploaded_file(f):
    """
    يتحقق من نوع الملف وحجمه قبل الحفظ
    """
    allowed_exts = ["pdf", "jpg", "jpeg", "png", "doc", "docx"]
    max_size = 5 * 1024 * 1024  # 5 MB

    ext = os.path.splitext(f.name)[1][1:].lower()  # يجيب الامتداد بدون النقطة
    if ext not in allowed_exts:
        raise ValidationError(f"File type .{ext} not allowed. Allowed: {', '.join(allowed_exts)}")

    if f.size > max_size:
        raise ValidationError(f"File {f.name} too large. Max size is 5 MB.")

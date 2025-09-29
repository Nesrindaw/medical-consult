# backend/consultations/zaincash_views.py
import time
import json
import logging
import jwt
import requests
from urllib.parse import urlencode
from django.http import JsonResponse, HttpResponseRedirect
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.shortcuts import redirect, get_object_or_404
from .models import Consultation

logger = logging.getLogger(__name__)

ZAINCASH_INIT_URL = settings.ZAINCASH_BASE_URL.rstrip("/") + "/transaction/init"
ZAINCASH_PAY_URL  = settings.ZAINCASH_BASE_URL.rstrip("/") + "/transaction/pay?id="
ZAINCASH_GET_URL  = settings.ZAINCASH_BASE_URL.rstrip("/") + "/transaction/get"


def _jwt_sign(payload: dict) -> str:
    """
    يوقّع الـ payload باستخدام HS256 بالـ Private Key (ZAINCASH_SECRET)
    ويضيف iat/exp تلقائياً (صلاحية 1 ساعة)
    """
    now = int(time.time())
    body = {
        **payload,
        "iat": now,
        "exp": now + 3600,  # 1 hour
    }
    token = jwt.encode(
        body,
        settings.ZAINCASH_SECRET,
        algorithm="HS256",
    )
    # PyJWT>=2 يعيد str
    return token


def _init_transaction(amount_iqd: int, order_id: int, lang: str = "ar") -> dict:
    """
    ينشئ معاملة جديدة عبر /transaction/init ويعيد dict من الاستجابة.
    """
    payload = {
        "amount": int(amount_iqd),
        "serviceType": "Consultation",
        "msisdn": int(settings.ZAINCASH_MSISDN),  # رقم تاجر
        "orderId": int(order_id),                 # Primary Key لطلبك
        "redirectUrl": settings.ZAINCASH_REDIRECT_URL,
    }
    token = _jwt_sign(payload)

    data = {
        "token": token,
        "merchantId": settings.ZAINCASH_MERCHANT_ID,
        "lang": lang,
    }

    logger.info("CreatePayment request: %s", {**data, "token": token[:20] + "..."} )
    r = requests.post(ZAINCASH_INIT_URL, data=data, timeout=20)
    logger.info("ZainCash init response: %s", r.text)
    try:
        return r.json()
    except Exception:
        return {"err": {"msg": "invalid_response", "raw": r.text}}


def _get_transaction_status(trans_id: str) -> dict:
    """
    يستعلم عن حالة العملية عبر /transaction/get
    """
    payload = {
        "id": trans_id,
        "msisdn": int(settings.ZAINCASH_MSISDN),
    }
    token = _jwt_sign(payload)
    data = {
        "token": token,
        "merchantId": settings.ZAINCASH_MERCHANT_ID,
    }
    r = requests.post(ZAINCASH_GET_URL, data=data, timeout=20)
    logger.info("ZainCash get response: %s", r.text)
    try:
        return r.json()
    except Exception:
        return {"err": {"msg": "invalid_response", "raw": r.text}}


@csrf_exempt
def create_payment(request):
    """
    POST JSON: { consultation_id, amount? }
    يرجّع pay_url لفتح بوابة الدفع.
    """
    if request.method != "POST":
        return JsonResponse({"error": "Invalid method"}, status=405)

    try:
        data = json.loads(request.body.decode("utf-8"))
    except Exception:
        data = {}

    consultation_id = data.get("consultation_id")
    amount = data.get("amount") or getattr(settings, "ZAINCASH_AMOUNT_IQD", 20000)

    if not consultation_id:
        return JsonResponse({"error": "consultation_id required"}, status=400)

    consultation = get_object_or_404(Consultation, id=consultation_id)

    if consultation.paid:
        return JsonResponse({"error": "Already paid"}, status=400)

    # إنشاء المعاملة
    init_resp = _init_transaction(amount_iqd=int(amount), order_id=consultation.id, lang="ar")

    if "id" in init_resp:
        # أعط الـ frontend رابط الدفع
        pay_url = ZAINCASH_PAY_URL + init_resp["id"]
        # احفظ الـ transaction_id مبدئياً (اختياري)
        consultation.zaincash_transaction_id = init_resp["id"]
        consultation.save(update_fields=["zaincash_transaction_id"])
        return JsonResponse({"pay_url": pay_url, "id": init_resp["id"]}, status=200)

    # فشل
    msg = init_resp.get("err", {}).get("msg", "cannot_generate_token")
    return JsonResponse({"error": msg, "raw": init_resp}, status=400)


def _final_redirect(ok: bool, order_id: int):
    """
    يعيد توجيه المستخدم إلى صفحة الواجهة الأمامية (Success/Failed)
    مع باراميترات بسيطة.
    """
    base = settings.ZAINCASH_REDIRECT_OK if ok else settings.ZAINCASH_REDIRECT_FAIL
    qs = urlencode({"status": "success" if ok else "failed", "orderId": order_id})
    return HttpResponseRedirect(f"{base}?{qs}")


@csrf_exempt
def zaincash_callback(request):
    """
    ZainCash سيعيد توجيه المستخدم إلى هذا الـ URL ويحمل باراميتر token في الـ query.
    نفكّ التوقيع ونقرأ الحالة، ثم نثبّت الدفع في قاعدة البيانات ونحوّل المستخدم للـ frontend.
    """
    token = request.GET.get("token") or request.POST.get("token")
    if not token:
        # fallback: لو ما فيه token، نحاول حالة get عبر transaction_id السابق (نادر)
        return JsonResponse({"error": "token missing"}, status=400)

    try:
        payload = jwt.decode(
            token,
            settings.ZAINCASH_SECRET,
            algorithms=["HS256"],
        )
        # عادة يحتوي:
        # id (transaction_id), orderId, status (success/failure) - هذا يعتمد على المنصة
        trans_id = str(payload.get("id", ""))
        order_id = int(payload.get("orderId", 0))
        status_str = str(payload.get("status", "")).lower()

        logger.info("Callback payload: %s", payload)

        # تحقّق/تأكيد من الـ status من /transaction/get إذا ما فيه status واضح
        if not status_str and trans_id:
            get_resp = _get_transaction_status(trans_id)
            # حاول استنتاج النجاح
            status_str = str(get_resp.get("status", "")).lower() or str(
                get_resp.get("message", "")
            ).lower()

        ok = status_str == "success"

        if order_id:
            # حدّث الاستشارة
            try:
                consultation = Consultation.objects.get(id=order_id)
                if ok:
                    consultation.paid = True
                    consultation.status = "PAID"
                    if trans_id:
                        consultation.zaincash_transaction_id = trans_id
                    consultation.save(update_fields=["paid", "status", "zaincash_transaction_id"])
                else:
                    # ممكن تسجّل محاولة فاشلة أو تحتفظ بالـ trans_id
                    if trans_id:
                        consultation.zaincash_transaction_id = trans_id
                        consultation.save(update_fields=["zaincash_transaction_id"])
            except Consultation.DoesNotExist:
                logger.error("Consultation %s not found in callback", order_id)

        # رجّع المستخدم لصفحة الواجهة (نجاح/فشل)
        return _final_redirect(ok=ok, order_id=order_id or 0)

    except jwt.ExpiredSignatureError:
        logger.warning("Callback token expired")
        return _final_redirect(ok=False, order_id=0)
    except jwt.InvalidTokenError:
        logger.warning("Callback invalid token")
        return _final_redirect(ok=False, order_id=0)
    except Exception as e:
        logger.exception("Callback error: %s", e)
        return _final_redirect(ok=False, order_id=0)

import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Spinner,
  Text,
  VStack,
  useToast,
  Container,
  HStack,
  Badge,
} from "@chakra-ui/react";
import { api } from "../utils/api"; // ← استخدمي الهيلبر الموحد

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [lastError, setLastError] = useState("");
  const navigate = useNavigate();
  const toast = useToast();

  // نستقبل consultation_id من الـ URL
  const consultationId = searchParams.get("consultation_id");

  const createPayment = useCallback(async () => {
    if (!consultationId) {
      setLoading(false);
      setLastError("لا يوجد Consultation ID في الرابط.");
      toast({
        title: "خطأ",
        description: "لا يوجد Consultation ID",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      setLastError("");

      // نرسل للباك إند لبدء جلسة الدفع
      const { data } = await api.post("/payments/zaincash/create/", {
        consultation_id: Number(consultationId),
      });

      // ندعم عدة مفاتيح محتملة من الباك إند
      const payUrl = data.pay_url || data.payment_url || data.redirect_url;

      if (!payUrl) {
        throw new Error("لم نستلم رابط بوابة الدفع من الخادم.");
      }

      // تحويل مباشر لبوابة الدفع
      window.location.replace(payUrl);
    } catch (error) {
      console.error(error);
      const msg =
        error?.response?.data?.error ||
        error?.message ||
        "فشل إنشاء جلسة الدفع";

      setLastError(msg);
      setLoading(false);

      toast({
        title: "خطأ",
        description: typeof msg === "string" ? msg : "فشل إنشاء جلسة الدفع",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  }, [consultationId, toast]);

  useEffect(() => {
    createPayment();
  }, [createPayment]);

  return (
    <Container maxW="md" py={10}>
      <Box p={6} rounded="2xl" boxShadow="lg" textAlign="center" bg="white" _dark={{ bg: "gray.800" }}>
        <VStack spacing={4}>
          <Text fontSize="xl" fontWeight="bold">جاري تجهيز الدفع عبر زين كاش</Text>

          <HStack fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
            <Text>رقم الطلب:</Text>
            <Badge colorScheme={consultationId ? "teal" : "gray"}>
              {consultationId || "-"}
            </Badge>
          </HStack>

          {loading ? (
            <>
              <Spinner size="xl" />
              <Text>جاري تحويلك إلى بوابة الدفع...</Text>
              <Text fontSize="xs" color="gray.500">
                لو تأخر التحويل، يمكنك الضغط على "إعادة المحاولة".
              </Text>
            </>
          ) : (
            <>
              <Text color="red.500" fontSize="sm">
                {lastError || "فشل إنشاء جلسة الدفع."}
              </Text>
              <HStack spacing={3}>
                <Button colorScheme="teal" onClick={createPayment}>
                  إعادة المحاولة
                </Button>
                <Button variant="outline" onClick={() => navigate("/")}>
                  العودة للرئيسية
                </Button>
                {consultationId && (
                  <Button onClick={() => navigate(`/consultations/${consultationId}`)}>
                    عرض الاستشارة
                  </Button>
                )}
              </HStack>
            </>
          )}
        </VStack>
      </Box>
    </Container>
  );
}

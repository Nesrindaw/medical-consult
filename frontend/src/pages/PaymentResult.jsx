
import React, { useMemo } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Divider,
  Badge,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";

export default function PaymentResult() {
  const navigate = useNavigate();
  const { search, pathname } = useLocation();

  // يدعم حالتين:
  // 1) /payment/result?status=success|failed&orderId=123
  // 2) لو أحدهم استخدم /success أو /failed أيضاً نتعامل مع الاسم مباشرة
  const params = useMemo(() => new URLSearchParams(search), [search]);
  let status = (params.get("status") || "").toLowerCase();
  const orderId = params.get("orderId") || "";

  if (!status) {
    if (pathname.endsWith("/success")) status = "success";
    if (pathname.endsWith("/failed")) status = "failed";
  }

  const isSuccess = status === "success";

  const goHome = () => navigate("/");
  const tryAgain = () => {
    // نعيد المستخدم لصفحة الدفع (تُنشئ Session جديدة)
    if (orderId) {
      navigate(`/checkout?consultation_id=${orderId}`);
    } else {
      navigate("/");
    }
  };
  const viewConsultation = () => {
    if (orderId) {
      // حسب الراوتر عندك: consultations/:id
      navigate(`/consultations/${orderId}`);
    } else {
      navigate("/");
    }
  };

  return (
    <Container maxW="lg" py={12}>
      <Box
        p={8}
        rounded="2xl"
        boxShadow="lg"
        bg="white"
        _dark={{ bg: "gray.800" }}
      >
        <VStack align="stretch" spacing={6}>
          <Heading size="lg" textAlign="center">
            نتيجة الدفع
          </Heading>

          {status ? (
            isSuccess ? (
              <Alert status="success" rounded="md">
                <AlertIcon />
                <Box>
                  <Text fontWeight="bold" mb={1}>
                    تم الدفع بنجاح 🎉
                  </Text>
                  <Text>
                    استلمنا طلبك، وسيقوم الطبيب بمراجعة الاستشارة والتواصل معك
                    قريبًا.
                  </Text>
                </Box>
              </Alert>
            ) : (
              <Alert status="error" rounded="md">
                <AlertIcon />
                <Box>
                  <Text fontWeight="bold" mb={1}>
                    الدفع لم يكتمل
                  </Text>
                  <Text>
                    لم تتم العملية بنجاح. يمكنك المحاولة مرة أخرى أو اختيار الدفع لاحقًا.
                  </Text>
                </Box>
              </Alert>
            )
          ) : (
            <Alert status="info" rounded="md">
              <AlertIcon />
              تعذّر تحديد حالة الدفع. جرّب إعادة المحاولة.
            </Alert>
          )}

          <Box>
            <Heading size="sm" mb={2}>
              تفاصيل الطلب
            </Heading>
            <VStack
              align="stretch"
              spacing={2}
              fontSize="sm"
              bg="gray.50"
              _dark={{ bg: "gray.700" }}
              p={4}
              rounded="md"
            >
              <HStack justify="space-between">
                <Text color="gray.600" _dark={{ color: "gray.300" }}>
                  رقم الطلب
                </Text>
                <Badge colorScheme={orderId ? "teal" : "gray"}>
                  {orderId || "-"}
                </Badge>
              </HStack>
              <HStack justify="space-between">
                <Text color="gray.600" _dark={{ color: "gray.300" }}>
                  الحالة
                </Text>
                <Badge colorScheme={isSuccess ? "green" : status ? "red" : "gray"}>
                  {status || "غير معروف"}
                </Badge>
              </HStack>
            </VStack>
          </Box>

          <Divider />

          <HStack spacing={3} flexWrap="wrap">
            <Button onClick={goHome} variant="outline">
              العودة للرئيسية
            </Button>

            {orderId ? (
              <>
                {!isSuccess && (
                  <Button colorScheme="teal" onClick={tryAgain}>
                    إعادة المحاولة
                  </Button>
                )}
                <Button onClick={viewConsultation}>عرض الاستشارة</Button>
              </>
            ) : (
              !isSuccess && (
                <Button colorScheme="teal" onClick={tryAgain}>
                  إعادة المحاولة
                </Button>
              )
            )}
          </HStack>
        </VStack>
      </Box>
    </Container>
  );
}

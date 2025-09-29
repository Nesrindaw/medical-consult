import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Badge,
  Button,
  VStack,
  Spinner,
  Link as CLink,
  useToast,
  Divider,
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { api } from "../utils/api";

export default function ConsultationDetail() {
  const { id } = useParams();
  const [c, setC] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const toast = useToast();

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/consultations/${id}/`);
      setC(res.data);
    } catch {
      toast({ title: "تعذر تحميل التفاصيل", status: "error", duration: 2500 });
    } finally {
      setLoading(false);
    }
  };

  const markReviewed = async () => {
    try {
      setMarking(true);
      await api.post(`/consultations/${id}/mark_reviewed/`, {});
      setC((prev) => ({ ...prev, status: "REVIEWED" }));
      toast({ title: "تم تحديث الحالة", status: "success", duration: 2000 });
    } catch {
      toast({ title: "فشل التحديث", status: "error", duration: 2500 });
    } finally {
      setMarking(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  if (loading)
    return (
      <Box textAlign="center" mt={16}>
        <Spinner size="xl" />
      </Box>
    );
  if (!c) return <Box p={6}>لا توجد بيانات</Box>;

  return (
    <Box p={6} borderWidth="1px" borderRadius="md" boxShadow="md" bg="white">
      <Heading size="lg" mb={4}>
        تفاصيل الاستشارة #{c.id}
      </Heading>
      <VStack align="start" spacing={3}>
        <Text>
          <strong>الاسم:</strong> {c.patient_name}
        </Text>
        <Text>
          <strong>العمر:</strong> {c.patient_age}
        </Text>
        <Text>
          <strong>البريد:</strong> {c.patient_email || "-"}
        </Text>
        <Text>
          <strong>الهاتف:</strong> {c.patient_phone || "-"}
        </Text>
        <Text>
          <strong>الرسالة:</strong> {c.message}
        </Text>
        <Divider />
        <Text>
          <strong>الحالة:</strong>{" "}
          <Badge colorScheme={c.status === "REVIEWED" ? "green" : "yellow"}>
            {c.status}
          </Badge>
        </Text>
        <Text>
          <strong>الدفع:</strong>{" "}
          <Badge colorScheme={c.paid ? "green" : "red"}>
            {c.paid ? "مدفوعة" : "غير مدفوعة"}
          </Badge>
        </Text>
        <Divider />
        <Box>
          <strong>الملفات:</strong>{" "}
          {c.files && c.files.length > 0 ? (
            c.files.map((f, i) => (
              <div key={i}>
                <CLink href={f.file} isExternal color="teal.500">
                  تحميل ملف {i + 1}
                </CLink>
              </div>
            ))
          ) : (
            <span>لا يوجد ملفات</span>
          )}
        </Box>

        {c.status !== "REVIEWED" && (
          <Button
            mt={4}
            colorScheme="teal"
            onClick={markReviewed}
            isLoading={marking}
          >
            Mark as Reviewed
          </Button>
        )}
      </VStack>
    </Box>
  );
}

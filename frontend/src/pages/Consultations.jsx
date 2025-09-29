import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { api } from "../utils/api";

export default function Consultations() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/consultations/");
      setRows(res.data.results || res.data); // ✅ دعم للـ pagination
    } catch {
      toast({ title: "تعذر التحميل", status: "error", duration: 2500 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading)
    return (
      <Box textAlign="center" mt={16}>
        <Spinner size="xl" />
      </Box>
    );

  return (
    <Box>
      <Heading size="lg" mb={6}>
        كل الاستشارات
      </Heading>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>الاسم</Th>
            <Th>الهاتف</Th>
            <Th>الحالة</Th>
            <Th>الدفع</Th>
            <Th>تفاصيل</Th>
          </Tr>
        </Thead>
        <Tbody>
          {rows.map((c) => (
            <Tr key={c.id}>
              <Td>{c.id}</Td>
              <Td>{c.patient_name}</Td>
              <Td>{c.patient_phone}</Td>
              <Td>
                <Badge
                  colorScheme={c.status === "REVIEWED" ? "green" : "yellow"}
                >
                  {c.status}
                </Badge>
              </Td>
              <Td>
                <Badge colorScheme={c.paid ? "green" : "red"}>
                  {c.paid ? "مدفوعة" : "غير مدفوعة"}
                </Badge>
              </Td>
              <Td>
                {/* ✅ تعديل المسار الصحيح مطابق لـ App.jsx */}
                <Button
                  as={Link}
                  to={`/consultations/${c.id}`}
                  size="sm"
                  colorScheme="teal"
                >
                  عرض
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}

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
  Button,
  Spinner,
  useToast,
  Badge,
  Link,
  Input,         // ✅ إضافة: Input للبحث
  Flex,          // ✅ إضافة: Flex لترتيب البحث مع الأزرار
} from "@chakra-ui/react";
import axios from "axios";

export default function DoctorDashboard() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);        // ✅ إضافة: رقم الصفحة الحالية
  const [search, setSearch] = useState("");   // ✅ إضافة: نص البحث
  const [nextPage, setNextPage] = useState(null); // ✅ إضافة: رابط الصفحة التالية
  const [prevPage, setPrevPage] = useState(null); // ✅ إضافة: رابط الصفحة السابقة

  const toast = useToast();
  const token = localStorage.getItem("access_token");

  // ✅ تعديل: fetchConsultations يدعم البحث والصفحات
  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://127.0.0.1:8000/api/doctor/consultations/?search=${search}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setConsultations(response.data.results || response.data); // ✅ استخدام results لو pagination مفعلة
      setNextPage(response.data.next || null);
      setPrevPage(response.data.previous || null);

    } catch (err) {
      toast({
        title: "Error fetching consultations",
        description: "Please try again later.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ نفس السابق لتغيير الحالة
  const markReviewed = async (id) => {
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/consultations/${id}/mark_reviewed/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast({
        title: "Consultation reviewed",
        description: `Consultation #${id} marked as reviewed.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchConsultations();
    } catch (err) {
      toast({
        title: "Update failed",
        description: "Could not update consultation status.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchConsultations();
    // eslint-disable-next-line
  }, [page]); // ✅ استدعاء عند تغيير الصفحة

  if (loading) {
    return (
      <Box textAlign="center" mt={20}>
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box p={6}>
      <Heading mb={6}>Doctor Dashboard</Heading>

      {/* ✅ إضافة: مربع البحث */}
      <Flex mb={4} gap={2}>
        <Input
          placeholder="Search consultations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button colorScheme="teal" onClick={() => { setPage(1); fetchConsultations(); }}>
          Search
        </Button>
      </Flex>

      <Table variant="striped" colorScheme="gray">
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>Patient</Th>
            <Th>Email</Th>
            <Th>Message</Th>
            <Th>Files</Th>
            <Th>Status</Th>
            <Th>Created</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {consultations.map((c) => (
            <Tr key={c.id}>
              <Td>{c.id}</Td>
              <Td>{c.patient_name}</Td>
              <Td>{c.patient_email || "-"}</Td>
              <Td maxW="250px" whiteSpace="pre-wrap">
                {c.message}
              </Td>
              <Td>
                {c.files && c.files.length > 0 ? (
                  c.files.map((f, i) => (
                    <Box key={i}>
                      <Link href={f.file} isExternal color="teal.500">
                        ملف {i + 1}
                      </Link>
                    </Box>
                  ))
                ) : (
                  <i>لا توجد ملفات</i>
                )}
              </Td>
              <Td>
                <Badge
                  colorScheme={
                    c.status === "PENDING"
                      ? "yellow"
                      : c.status === "PAID"
                      ? "green"
                      : "blue"
                  }
                >
                  {c.status}
                </Badge>
              </Td>
              <Td>{new Date(c.created_at).toLocaleString()}</Td>
              <Td>
                {c.status === "PAID" && (
                  <Button
                    size="sm"
                    colorScheme="teal"
                    onClick={() => markReviewed(c.id)}
                  >
                    Mark Reviewed
                  </Button>
                )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* ✅ إضافة: Pagination */}
      <Flex justify="space-between" mt={4}>
        <Button
          onClick={() => setPage(page - 1)}
          isDisabled={!prevPage}
        >
          Previous
        </Button>
        <Button
          onClick={() => setPage(page + 1)}
          isDisabled={!nextPage}
        >
          Next
        </Button>
      </Flex>
    </Box>
  );
}

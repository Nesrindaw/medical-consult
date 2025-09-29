import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  useToast,
  Text,
  Container,
  SimpleGrid,
  GridItem,
} from "@chakra-ui/react";
import { api } from "../utils/api";

export default function PatientForm() {
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const toast = useToast();

  const handleFileChange = (e) => setFiles(e.target.files || []);

  const createConsultation = async () => {
    const form = new FormData();
    form.append("patient_name", patientName);
    form.append("patient_age", Number(patientAge));
    if (patientEmail) form.append("patient_email", patientEmail);
    form.append("patient_phone", patientPhone);
    form.append("message", message);
    for (let i = 0; i < files.length; i++) {
      form.append("uploaded_files", files[i]);
    }
    const res = await api.post("/consultations/", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  };

  const handlePayLater = async () => {
    try {
      const data = await createConsultation();
      toast({
        title: "تم الإرسال",
        description: data.notice || "تم تسجيل الاستشارة. سيتواصل الطبيب معك قريباً.",
        status: "success",
        duration: 4000,
        isClosable: true,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "خطأ",
        description: "تعذر إنشاء الاستشارة",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handlePayZainCash = async () => {
    try {
      const data = await createConsultation();
      const cid = data.consultation_id;

      const resp = await api.post("/payments/zaincash/create/", {
        consultation_id: cid,
      });

      const url = resp.data.payment_url;
      window.location.href = url;
    } catch (err) {
      console.error(err);
      toast({
        title: "خطأ",
        description: "تعذر بدء الدفع عبر ZainCash",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      minH="100vh"
      bg="gray.50"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
    >
      <Container
        maxW="xl" // 👈 المربع صار أكبر
        w="full"
        p={8}
        borderWidth={1}
        borderRadius="lg"
        boxShadow="lg"
        bg="white"
      >
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>

            <FormControl isRequired>
            <FormLabel textAlign="right">العمر</FormLabel>
            <Input
              type="number"
              value={patientAge}
              onChange={(e) => setPatientAge(e.target.value)}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel textAlign="right">اسم المريض</FormLabel>
            <Input value={patientName} onChange={(e) => setPatientName(e.target.value)} />
          </FormControl>



          <FormControl>
            <FormLabel textAlign="right">البريد الإلكتروني (اختياري)</FormLabel>
            <Input
              type="email"
              value={patientEmail}
              onChange={(e) => setPatientEmail(e.target.value)}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel textAlign="right">رقم الهاتف</FormLabel>
            <Input value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} />
          </FormControl>

          <GridItem colSpan={{ base: 1, md: 2 }}>
            <FormControl isRequired>
              <FormLabel textAlign="right">نص الاستشارة</FormLabel>
              <Textarea
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </FormControl>
          </GridItem>

          <GridItem colSpan={{ base: 1, md: 2 }}>
            <FormControl>
              <FormLabel textAlign="right">تحميل الملفات (اختياري)</FormLabel>
              <Input type="file" multiple onChange={handleFileChange} />
              <Text mt={1} fontSize="sm" color="gray.600">
                يسمح برفع عدة ملفات (صور/PDF).
              </Text>
            </FormControl>
          </GridItem>

          {/* الأزرار تحت بعض */}
          <GridItem colSpan={{ base: 1, md: 2 }}>
            <VStack spacing={3} align="stretch">
              <Button size="md" colorScheme="teal" onClick={handlePayZainCash}>
                💳 أرسل الاستشارة وادفع الآن عبر Zaincash
              </Button>
              <Button size="md" colorScheme="gray" onClick={handlePayLater}>
                ⏳ أرسل الاستشارة وادفع لاحقاً
              </Button>
            </VStack>
          </GridItem>
        </SimpleGrid>
      </Container>
    </Box>
  );
}


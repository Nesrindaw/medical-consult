import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  useToast,
  Container,
  HStack,
  Text,
  IconButton,
} from "@chakra-ui/react";
import { useNavigate, Link } from "react-router-dom";
import { FaStethoscope, FaEnvelope, FaPhone, FaHome } from "react-icons/fa";
import axios from "axios";

export default function DoctorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/auth/login/", {
        email,
        password,
      });

      const { access, refresh } = response.data;

      // حفظ التوكنات
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      toast({
        title: "تم تسجيل الدخول",
        description: "مرحباً بعودتك يا دكتور!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      navigate("/doctor/dashboard");
    } catch (err) {
      toast({
        title: "فشل تسجيل الدخول",
        description: "بيانات الاعتماد غير صحيحة. حاول مرة أخرى.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="white" display="flex" flexDirection="column">
      {/* ===== Hero Section ===== */}
      <Box
      flex="2"
      display="flex"
        bgGradient="linear(to-r, teal.500, cyan.500)"
        color="white"
        py={2}
        textAlign="center"
      
      >
        <Container maxW="container.md">
          {/* Logo + Title */}
          <HStack justify="center" spacing={3} mb={6}>
            <FaStethoscope color="black" size="50px" />
            <Heading color="black" size="2xl" fontWeight="black">
              شخصني
            </Heading>
          </HStack>

          <Heading size="lg" fontWeight="bold" mb={6}>
            تسجيل دخول الأطباء
          </Heading>

          {/* Login Card */}
          <Box
            bg="white"
            color="black"
            p={8}
            borderRadius="xl"
            boxShadow="lg"
            maxW="400px"
            mx="auto"
          >
            <form onSubmit={handleLogin}>
              <VStack spacing={4}>
                <FormControl id="email" isRequired>
                  <FormLabel>البريد الإلكتروني</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="أدخل بريدك الإلكتروني"
                  />
                </FormControl>

                <FormControl id="password" isRequired>
                  <FormLabel>كلمة المرور</FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور"
                  />
                </FormControl>

                <Button
                  colorScheme="teal"
                  type="submit"
                  size="lg"
                  w="full"
                  isLoading={loading}
                >
                  دخول
                </Button>
              </VStack>
            </form>
          </Box>

          {/* ===== Contact Note ===== */}
          <VStack
          flex="1"
      display="flex"
           spacing={2} mt={8} color="white">
            <Text>هل تواجه مشكلة في تسجيل الدخول؟ تواصل معنا:</Text>
            <HStack spacing={6} justify="center">
              <HStack spacing={2}>
                <FaEnvelope />
                <Text>support@shakhsi.com</Text>
              </HStack>
              <HStack spacing={2}>
                <FaPhone />
                <Text>+111 000 0000</Text>
              </HStack>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* ===== Footer (رجوع للصفحة الرئيسية) ===== */}
      <Box textAlign="center" py={4} bg="gray.50">
        <IconButton
          as={Link}
          to="/"
          aria-label="الصفحة الرئيسية"
          icon={<FaHome />}
          size="sm"
          colorScheme="teal"
          variant="ghost"
        />
        <Text fontSize="sm" color="gray.600" mt={2}>
          العودة إلى الصفحة الرئيسية
        </Text>
      </Box>
    </Box>
  );
}

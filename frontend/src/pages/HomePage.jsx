import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Container,
  IconButton,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { InfoIcon, CalendarIcon } from "@chakra-ui/icons";
import { FaUserMd, FaStethoscope } from "react-icons/fa";
import { Briefcase } from "lucide-react";

export default function HomePage() {
  return (
    <Box minH="100vh" bg="white" display="flex" flexDirection="column">
      {/*  Hero Section */}
      <Box
        flex="2"
        bgGradient="linear(to-r, teal.500, cyan.500)"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        color="white"
        textAlign="center"
        px={2}
      >
        <Container maxW="container.lg">
          {/* Logo + Title */}
          <HStack justify="center" spacing={2} mb={6}>
            <FaStethoscope color="black" size="50px" />
            <Heading color="black" size="2xl" fontWeight="black">
              شخصني
            </Heading>
          </HStack>

          {/* Main Headline */}
          <Heading size="md" fontWeight="bold" mb={6}>
            شخصني... منصتك الطبية الذكية في العراق
          </Heading>

          {/* Long Marketing Text */}
          <VStack spacing={3} maxW="800px" mx="auto" mb={6}>
            <Text fontSize="md" fontWeight="bold">
              احصل على تشخيص دقيق وآمن من نخبة الأطباء العراقيين بخطوات بسيطة، أينما كنت وفي أي وقت
            </Text>
            <Text fontSize="md" fontWeight="bold">
              إذا لم تجد التشخيص الصحيح بعد، نحن هنا لنمنحك الرأي الطبي الموثوق والدقيق
            </Text>
            <Text fontSize="md" fontWeight="bold">
              لأن صحتك لا تحتمل الانتظار، اجعل{" "}
              <Text as="span" color="black" fontWeight="bold">
                شخصني
              </Text>{" "}
              وجهتك الأولى
            </Text>
          </VStack>

          {/* Action Buttons */}
          <VStack spacing={4} align="center">
            <Button
              as={Link}
              to="/patient"
              size="lg"
              px={12}
              py={6}
              fontSize="xl"
              colorScheme="teal"
              leftIcon={<CalendarIcon />}
            >
              إنشاء استشارة
            </Button>

            <HStack spacing={4}>
              <Button
                as={Link}
                to="/about"
                size="md"
                colorScheme="cyan"
                leftIcon={<InfoIcon />}
              >
                عن شخصني
              </Button>
              <Button
                as={Link}
                to="/login"
                size="md"
                colorScheme="whiteAlpha"
                leftIcon={<FaUserMd />}
              >
                دخول الطبيب
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/*  Features Section  */}
      <Container maxW="container.lg" py={12}>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} textAlign="center">
          <Box>
            <Box flex="1" display="flex" justifyContent="center">
              <FaUserMd size="40" color="#0ABAB5" />
            </Box>
            <Heading size="md" mt={4}>
              أطباء موثوقون
            </Heading>
            <Text color="gray.600" mt={2}>
              نخبة من أفضل الأطباء في مختلف التخصصات الطبية.
            </Text>
          </Box>

          <Box>
            <InfoIcon boxSize={8} color="#0ABAB5" />
            <Heading size="md" mt={4}>
              تشخيص آمن
            </Heading>
            <Text color="gray.600" mt={2}>
              خصوصيتك محمية، والتشخيص يتم بسرية تامة.
            </Text>
          </Box>

          <Box>
            <CalendarIcon boxSize={8} color="#0ABAB5" />
            <Heading size="md" mt={4}>
              استشارة سريعة
            </Heading>
            <Text color="gray.600" mt={2}>
              خطوات سهلة وسريعة لطلب استشارة من طبيبك.
            </Text>
          </Box>
        </SimpleGrid>
      </Container>

      {/* زر الوظائف أسفل يسار الصفحة */}
      <Box position="fixed" bottom="30px" left="30px">
        <Link to="/jobs">
          <IconButton
            icon={<Briefcase size={40} />}
            aria-label="وظائف"
            colorScheme="teal"
            borderRadius="full"
            size="lg"
            shadow="lg"
            _hover={{bgGradient: "linear(to-r, teal.400, cyan.400)", 
        transform: "scale(1.05)", }}
        transition="all 0.3s ease-in-out"
          />
              <Text
        bgGradient="linear(to-r, teal.300, cyan.500)" 
        bgClip="text"
        fontWeight="bold"
        fontSize="2xl"

      >
        Jobs
      </Text>
        </Link>
      </Box>
    </Box>
  );
}

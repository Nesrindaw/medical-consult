import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Container,
  Button,
  SimpleGrid,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { FaStethoscope, FaEnvelope, FaPhone } from "react-icons/fa";

export default function About() {
  return (
    <Box minH="100vh" bg="white" display="flex" flexDirection="column">
      {/* ===== Hero Section ===== */}
      <Box
        flex="2" // ياخذ ثلثين الشاشة
        bgGradient="linear(to-r, teal.500, cyan.500)"
        color="white"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        textAlign="center"
        px={2}
      >
        <Container maxW="container.lg">
          {/* Logo + Title */}
          <HStack justify="center" spacing={3} mb={10}>
            <FaStethoscope color="black" size="50px" />
            <Heading color="black" size="3xl" fontWeight="black">
              شخصني
            </Heading>
          </HStack>


          {/* Description */}
          <VStack spacing={3} maxW="800px" mx="auto" color="white">
            <Text fontSize="lg">
              لأنك تستحق الراحة والاطمئنان، جمعنا لك نخبة الأطباء في منصة واحدة تمنحك التشخيص الصحيح من أي مكان وفي أي وقت.
            </Text>
            <Text fontSize="lg">
              مع{" "}
              <Text as="span" fontWeight="bold" color="black">
                <strong> شخصني </strong> 
              </Text>{" "}
              تختصر المسافة والانتظار، لتحصل على استشارة طبية سريعة، آمنة، وموثوقة.
            </Text>
            <Text fontSize="lg">
              نؤمن أن التشخيص الصحيح هو بداية العلاج الصحيح، فلا تدع القلق يطيل عليك… مع شخصني صحتك تبدأ من قرار واحد.
            </Text>
            <Text fontSize="lg">
              بعد إرسال استشارتك، سيتواصل معك الطبيب شخصيًا ليمنحك التشخيص والرأي الطبي الموثوق.
            </Text>
            <Text fontSize="lg">
              يمكنك الدفع بكل سهولة عبر <strong>زين كاش</strong> أو حتى لاحقًا، فالقرار بين يديك.
            </Text>
          </VStack>

          <Button as={Link} to="/" mt={6} size="md" colorScheme="whiteAlpha">
            العودة إلى الصفحة الرئيسية
          </Button>
        </Container>
      </Box>

      {/* ===== Contact Section ===== */}
      <Box flex="1" bg="gray.50" display="flex" alignItems="center">
        <Container maxW="container.md" textAlign="center">
          <Heading size="lg" mb={6} color="teal.600">
            تواصل معنا
          </Heading>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <HStack justify="center" spacing={3}>
              <FaEnvelope color="teal" size="20px" />
              <Text fontSize="md">info@shakhsi.com</Text>
            </HStack>
            <HStack justify="center" spacing={3}>
              <FaPhone color="teal" size="20px" />
              <Text fontSize="md">+111 000 000</Text>
            </HStack>
          </SimpleGrid>
        </Container>
      </Box>
    </Box>
  );
}

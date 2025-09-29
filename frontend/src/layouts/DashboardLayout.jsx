import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Flex,
  VStack,
  Heading,
  Button,
  Divider,
  IconButton,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { SunIcon, MoonIcon } from "@chakra-ui/icons";
import { logout, isAuthed } from "../utils/auth";

export default function DashboardLayout() {
  const { colorMode, toggleColorMode } = useColorMode();
  const bg = useColorModeValue("gray.50", "gray.800");
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAuthed()) navigate("/login");
  }, []);

  return (
    <Flex minH="100vh">
      <Box
        w={{ base: "260px" }}
        p={5}
        borderRight="1px solid"
        borderColor="gray.200"
        bg={bg}
      >
        <Heading size="md" mb={6}>
          Doctor Panel
        </Heading>

        {/* ✅ تعديلات المسارات */}
        <VStack align="stretch" spacing={3}>
          <Button
            as={Link}
            to="/doctor"
            variant={location.pathname === "/doctor" ? "solid" : "ghost"}
            colorScheme="teal"
          >
            Dashboard
          </Button>
          <Button
            as={Link}
            to="/doctor/consultations"
            variant={
              location.pathname.startsWith("/doctor/consultations")
                ? "solid"
                : "ghost"
            }
            colorScheme="teal"
          >
            All Consultations
          </Button>
          <Button
            as={Link}
            to="/doctor/settings"
            variant={
              location.pathname === "/doctor/settings" ? "solid" : "ghost"
            }
            colorScheme="teal"
          >
            Settings
          </Button>
        </VStack>

        <Divider my={6} />

        <VStack align="stretch" spacing={3}>
          <Button onClick={logout} colorScheme="red">
            Logout
          </Button>
          <IconButton
            aria-label="toggle theme"
            onClick={toggleColorMode}
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
          />
        </VStack>
      </Box>

      <Box flex="1" p={6}>
        <Outlet /> {/* ✅ هنا هتظهر الصفحات الفرعية */}
      </Box>
    </Flex>
  );
}

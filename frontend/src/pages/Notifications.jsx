import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  Spinner,
  Container,
  useToast,
  Card,
  CardBody,
} from "@chakra-ui/react";
import { api } from "../utils/api";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get("/notifications/");
        setNotifications(res.data);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load notifications",
          status: "error",
          duration: 4000,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [toast]);

  if (loading) {
    return (
      <Box textAlign="center" py={20}>
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Container maxW="4xl" py={10}>
      <Heading mb={6}>Notifications</Heading>
      <VStack spacing={4} align="stretch">
        {notifications.length === 0 ? (
          <Text>No notifications yet.</Text>
        ) : (
          notifications.map((n) => (
            <Card key={n.id} shadow="sm" borderRadius="lg">
              <CardBody>
                <Text fontWeight="bold">{n.title}</Text>
                <Text>{n.message}</Text>
                <Text fontSize="sm" color="gray.500">
                  {new Date(n.created_at).toLocaleString()}
                </Text>
              </CardBody>
            </Card>
          ))
        )}
      </VStack>
    </Container>
  );
}

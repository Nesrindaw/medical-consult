import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Spinner,
  useToast,
  Divider,
  Container,
  Card,
  CardHeader,
  CardBody,
  Input,
  FormControl,
  FormLabel,
  Select,
} from "@chakra-ui/react";
import { api } from "../utils/api";

export default function AdminPanel() {
  const [doctors, setDoctors] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [newDoctor, setNewDoctor] = useState({ name: "", email: "", specialty: "" });
  const toast = useToast();

  //  تحميل البيانات
  const fetchData = async () => {
    try {
      const [doctorRes, consultationRes] = await Promise.all([
        api.get("/admin/doctors/"),
        api.get("/admin/consultations/"),
      ]);
      setDoctors(doctorRes.data);
      setConsultations(consultationRes.data);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load admin data",
        status: "error",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // إضافة دكتور
  const handleAddDoctor = async () => {
    try {
      await api.post("/admin/doctors/add/", newDoctor);
      toast({ title: "Doctor added", status: "success", duration: 3000 });
      setNewDoctor({ name: "", email: "", specialty: "" });
      setShowAddDoctor(false);
      fetchData();
    } catch {
      toast({ title: "Error", description: "Failed to add doctor", status: "error" });
    }
  };

  //  حذف دكتور
  const handleDeleteDoctor = async (id) => {
    try {
      await api.delete(`/admin/doctors/${id}/delete/`);
      toast({ title: "Doctor deleted", status: "success", duration: 3000 });
      fetchData();
    } catch {
      toast({ title: "Error", description: "Failed to delete doctor", status: "error" });
    }
  };

  // حذف استشارة
  const handleDeleteConsultation = async (id) => {
    try {
      await api.delete(`/admin/consultations/${id}/delete/`);
      toast({ title: "Consultation deleted", status: "success", duration: 3000 });
      fetchData();
    } catch {
      toast({ title: "Error", description: "Failed to delete consultation", status: "error" });
    }
  };

  //  تعيين استشارة لطبيب
  const handleAssignConsultation = async (id, doctorId) => {
    try {
      await api.post(`/admin/consultations/${id}/assign/`, { doctor_id: doctorId });
      toast({ title: "Consultation assigned", status: "success", duration: 3000 });
      fetchData();
    } catch {
      toast({ title: "Error", description: "Failed to assign consultation", status: "error" });
    }
  };

  // تحديث حالة الاستشارة
  const handleUpdateStatus = async (id, status) => {
    try {
      await api.post(`/admin/consultations/${id}/status/`, { status });
      toast({ title: "Status updated", status: "success", duration: 3000 });
      fetchData();
    } catch {
      toast({
        title: "Error",
        description: "Failed to update status",
        status: "error",
        duration: 4000,
      });
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" py={20}>
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Container maxW="6xl" py={10}>
      <VStack spacing={10} align="stretch">
        {/* Doctors Section */}
        <Card shadow="md" borderRadius="2xl">
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="md">Doctors</Heading>
              <Button colorScheme="teal" onClick={() => setShowAddDoctor(!showAddDoctor)}>
                + Add Doctor
              </Button>
            </HStack>
          </CardHeader>
          <Divider />
          <CardBody>
            {showAddDoctor && (
              <VStack spacing={3} align="stretch" mb={5}>
                <FormControl>
                  <FormLabel>Name</FormLabel>
                  <Input
                    value={newDoctor.name}
                    onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={newDoctor.email}
                    onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Specialty</FormLabel>
                  <Input
                    value={newDoctor.specialty}
                    onChange={(e) => setNewDoctor({ ...newDoctor, specialty: e.target.value })}
                  />
                </FormControl>
                <Button colorScheme="teal" onClick={handleAddDoctor}>
                  Save Doctor
                </Button>
              </VStack>
            )}
            {doctors.length === 0 ? (
              <Text>No doctors found</Text>
            ) : (
              <VStack align="stretch" spacing={3}>
                {doctors.map((doc) => (
                  <HStack
                    key={doc.id}
                    p={4}
                    borderWidth="1px"
                    borderRadius="lg"
                    shadow="sm"
                    justify="space-between"
                  >
                    <Box>
                      <Text fontWeight="bold">{doc.name}</Text>
                      <Text fontSize="sm" color="gray.600">{doc.email}</Text>
                      <Text fontSize="sm">Specialty: {doc.specialty}</Text>
                    </Box>
                    <Button
                      size="sm"
                      colorScheme="red"
                      onClick={() => handleDeleteDoctor(doc.id)}
                    >
                      Delete
                    </Button>
                  </HStack>
                ))}
              </VStack>
            )}
          </CardBody>
        </Card>

        {/* Consultations Section */}
        <Card shadow="md" borderRadius="2xl">
          <CardHeader>
            <Heading size="md">Consultations</Heading>
          </CardHeader>
          <Divider />
          <CardBody>
            {consultations.length === 0 ? (
              <Text>No consultations yet</Text>
            ) : (
              <VStack align="stretch" spacing={3}>
                {consultations.map((c) => (
                  <Box
                    key={c.id}
                    p={4}
                    borderWidth="1px"
                    borderRadius="lg"
                    shadow="sm"
                  >
                    <HStack justify="space-between" align="start">
                      <Box>
                        <Text fontWeight="bold">{c.patient_name} ({c.patient_email})</Text>
                        <Text fontSize="sm">Status: {c.status}</Text>
                        <Text fontSize="sm" color="gray.500">
                          Created: {new Date(c.created_at).toLocaleString()}
                        </Text>

                        {/* Assign Doctor */}
                        <FormControl mt={3}>
                          <FormLabel fontSize="sm">Assign to Doctor</FormLabel>
                          <Select
                            placeholder="Select doctor"
                            onChange={(e) => handleAssignConsultation(c.id, e.target.value)}
                          >
                            {doctors.map((doc) => (
                              <option key={doc.id} value={doc.id}>
                                {doc.name} ({doc.specialty})
                              </option>
                            ))}
                          </Select>
                        </FormControl>

                        {/* Update Status */}
                        <FormControl mt={3}>
                          <FormLabel fontSize="sm">Change Status</FormLabel>
                          <Select
                            value={c.status}
                            onChange={(e) => handleUpdateStatus(c.id, e.target.value)}
                          >
                            <option value="PENDING">Pending</option>
                            <option value="REVIEWED">Reviewed</option>
                            <option value="CLOSED">Closed</option>
                          </Select>
                        </FormControl>
                      </Box>

                      <Button
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleDeleteConsultation(c.id)}
                      >
                        Delete
                      </Button>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
}

import React from "react";
import {
  Box,
  Heading,
  Text,
  Container,
  VStack,
  Card,
  CardBody,
} from "@chakra-ui/react";

export default function JobAds() {
 

  const jobs = [
{
  id: 1,
  title: "طبيب أمراض قلب",
  company: "منصة شخصني",
  location: "عن بُعد - العراق",
  description: "مطلوب طبيب مختص في أمراض القلب لتقديم استشارات طبية عبر منصة شخصني. يشترط خبرة في متابعة وتشخيص أمراض القلب وارتفاع ضغط الدم عن بُعد.\nللتقديم راسلنا على الإيميل: jobs@shakhsi.com",
},
{
  id: 2,
  title: "طبيبة نسائية وتوليد",
  company: "منصة شخصني",
  location: "عن بُعد - العراق",
  description: "نبحث عن طبيبة متخصصة في أمراض النساء والتوليد لتقديم استشارات آمنة وسرية للنساء عبر منصتنا.\nللتقديم راسلنا على الإيميل: jobs@shakhsi.com",
},
{
  id: 3,
  title: "طبيب أمراض جلدية",
  company: "منصة شخصني",
  location: "عن بُعد - العراق",
  description: "مطلوب طبيب أمراض جلدية لتقديم استشارات طبية في تشخيص الأمراض الجلدية ووصف العلاج المناسب أونلاين.\nللتقديم راسلنا على الإيميل: jobs@shakhsi.com",
},

{
  id: 4,
  title: "طبيب أسنان",
  company: "منصة شخصني",
  location: "عن بُعد - العراق",
  description: "مطلوب طبيب أسنان لتقديم استشارات وتشخيصات أولية للمرضى حول مشاكل الأسنان واللثة عبر منصة شخصني.\nللتقديم راسلنا على الإيميل: jobs@shakhsi.com",
},


  ];

  return (
    <Container maxW="5xl" py={10}>
      <Heading mb={6}>Job Ads</Heading>
      <VStack spacing={6} align="stretch">
        {jobs.map((job) => (
          <Card key={job.id} shadow="md" borderRadius="xl">
            <CardBody>
              <Heading size="md">{job.title}</Heading>
              <Text fontWeight="bold">{job.company}</Text>
              <Text color="gray.600">{job.location}</Text>
              <Text mt={2}>{job.description}</Text>
            </CardBody>
          </Card>
        ))}
      </VStack>
    </Container>
  );
  
}

//src/pages/StudentEnrollmentsPage.jsx

import { useContext, useEffect, useState } from "react";
import {
  Container, Typography, Button, Box, Card, CardContent, Stack,
} from "@mui/material";
import UserContext from "../context/UserContext.jsx";

const API_URL = import.meta.env.VITE_API_URL;

export default function StudentEnrollmentsPage() {
  const { user, logout } = useContext(UserContext);
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await fetch(`${API_URL}/enrollment`, { credentials: "include" });
      if (res.ok) setEnrollments(await res.json());
    }
    load();
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">My Enrollments — {user?.username}</Typography>
        <Stack direction="row" spacing={1}>
          <Button href="#/student">Browse Courses</Button>
          <Button onClick={logout}>Logout</Button>
        </Stack>
      </Stack>

      <Box sx={{ mt: 3 }}>
        {enrollments.map((e) => (
          <Card key={e._id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">{e.courseName}</Typography>
              <Typography color="text.secondary">
                Enrolled at: {new Date(e.enrolledAt).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        ))}
        {enrollments.length === 0 && <Typography>You are not enrolled in any courses.</Typography>}
      </Box>
    </Container>
  );
}

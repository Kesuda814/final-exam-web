//src/pages/StudentCoursesPage.jsx

import { useContext, useEffect, useState } from "react";
import {
  Container, Typography, Button, TextField, Box, Card, CardContent,
  CardActions, Stack,
} from "@mui/material";
import {UserContext} from "../context/UserContext.jsx";

const API_URL = import.meta.env.VITE_API_URL;

export default function StudentCoursesPage() {
  const { user, logout } = useContext(UserContext);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  async function loadCourses(q = "") {
    const res = await fetch(`${API_URL}/course?search=${encodeURIComponent(q)}`, {
      credentials: "include",
    });
    if (res.ok) setCourses(await res.json());
  }

  useEffect(() => {
    loadCourses();
  }, []);

  async function handleSearch(e) {
    e.preventDefault();
    loadCourses(search);
  }

  async function handleEnroll(courseId) {
    const res = await fetch(`${API_URL}/course/${courseId}/enroll`, {
      method: "POST",
      credentials: "include",
    });
    const data = await res.json();
    setMessage(res.ok ? "Enrolled successfully" : data.message || "Failed");
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">Available Courses — {user?.username}</Typography>
        <Stack direction="row" spacing={1}>
          <Button href="#/my-enrollments">My Enrollments</Button>
          <Button onClick={logout}>Logout</Button>
        </Stack>
      </Stack>
      {message && <Typography color="primary" sx={{ mt: 1 }}>{message}</Typography>}

      <Box component="form" onSubmit={handleSearch} sx={{ mt: 2, display: "flex", gap: 1 }}>
        <TextField
          label="Search by course or teacher name" size="small" fullWidth
          value={search} onChange={(e) => setSearch(e.target.value)}
        />
        <Button type="submit" variant="contained">Search</Button>
      </Box>

      <Box sx={{ mt: 3 }}>
        {courses.map((c) => (
          <Card key={c._id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">{c.name}</Typography>
              <Typography color="text.secondary">
                Teacher: {c.teacherUsername} | Status: {c.status} | Duration: {c.durationDays} days
              </Typography>
              <Typography color="text.secondary">
                Price: ${c.price} | Topics: {(c.topics || []).join(", ") || "—"}
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                disabled={c.status !== "Open"}
                onClick={() => handleEnroll(c._id)}
              >
                {c.status === "Open" ? "Enroll" : c.status}
              </Button>
            </CardActions>
          </Card>
        ))}
        {courses.length === 0 && <Typography>No courses found.</Typography>}
      </Box>
    </Container>
  );
}

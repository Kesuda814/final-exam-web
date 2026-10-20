//src/pages/TeacherCoursesPage.jsx

import { useContext, useEffect, useState } from "react";
import {
  Container, Typography, Button, TextField, Box, Card, CardContent,
  CardActions, Stack, MenuItem, Dialog, DialogTitle, DialogContent,
  List, ListItem, ListItemText, IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {UserContext} from "../context/UserContext.jsx";

const API_URL = import.meta.env.VITE_API_URL;
const STATUSES = ["Open", "Close", "Cancel"];

export default function TeacherCoursesPage() {
  const { user, logout } = useContext(UserContext);
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "", durationDays: "", price: "", maxStudent: "", topics: "", status: "Open",
  });
  const [editing, setEditing] = useState(null);
  const [studentsOf, setStudentsOf] = useState(null);
  const [students, setStudents] = useState([]);

  async function loadCourses() {
    const res = await fetch(`${API_URL}/course`, { credentials: "include" });
    if (res.ok) setCourses(await res.json());
  }

  useEffect(() => {
    loadCourses();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    const body = {
      name: form.name,
      durationDays: Number(form.durationDays),
      topics: form.topics ? form.topics.split(",").map((t) => t.trim()) : [],
      price: Number(form.price),
      maxStudent: Number(form.maxStudent),
      status: form.status,
    };
    const url = editing ? `${API_URL}/course/${editing._id}` : `${API_URL}/course`;
    const res = await fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.message || "Request failed");
      return;
    }
    setMessage(editing ? "Course updated" : "Course created");
    setEditing(null);
    setForm({ name: "", durationDays: "", price: "", maxStudent: "", topics: "", status: "Open" });
    loadCourses();
  }

  async function handleDelete(courseId) {
    const res = await fetch(`${API_URL}/course/${courseId}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    setMessage(res.ok ? "Course deleted" : data.message);
    loadCourses();
  }


  async function viewStudents(course) {
    const res = await fetch(`${API_URL}/course/${course._id}`, {
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      setStudents(data.enrolledStudents || []);
      setStudentsOf(course);
    }
  }

  function startEdit(course) {
    setEditing(course);
    setForm({
      name: course.name,
      durationDays: String(course.durationDays),
      price: String(course.price),
      maxStudent: String(course.maxStudent),
      topics: (course.topics || []).join(", "),
      status: course.status,
    });
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">Teacher Dashboard — {user?.username}</Typography>
        <Button onClick={logout}>Logout</Button>
      </Stack>
      {message && <Typography color="primary" sx={{ mt: 1 }}>{message}</Typography>}

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, p: 2, border: "1px solid #ddd", borderRadius: 2 }}>
        <Typography variant="h6">{editing ? "Edit Course" : "Create Course"}</Typography>
        <Stack direction="row" spacing={2} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
          <TextField label="Name" size="small" required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} sx={{ minWidth: 180 }} />
          <TextField label="Duration (days)" size="small" type="number" required value={form.durationDays}
            onChange={(e) => setForm({ ...form, durationDays: e.target.value })} sx={{ width: 140 }} />
          <TextField label="Price" size="small" type="number" required value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })} sx={{ width: 120 }} />
          <TextField label="Max students" size="small" type="number" required value={form.maxStudent}
            onChange={(e) => setForm({ ...form, maxStudent: e.target.value })} sx={{ width: 140 }} />
          <TextField label="Topics (comma separated)" size="small" value={form.topics}
            onChange={(e) => setForm({ ...form, topics: e.target.value })} sx={{ minWidth: 200 }} />
          <TextField label="Status" size="small" select value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })} sx={{ width: 120 }}>
            {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
          <Button type="submit" variant="contained">{editing ? "Update" : "Create"}</Button>
          {editing && (
            <Button onClick={() => { setEditing(null); setForm({ name: "", durationDays: "", price: "", maxStudent: "", topics: "", status: "Open" }); }}>
              Cancel
            </Button>
          )}
        </Stack>
      </Box>

      <Box sx={{ mt: 3 }}>
        {courses.map((c) => (
          <Card key={c._id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">{c.name}</Typography>
              <Typography color="text.secondary">
                Status: {c.status} | Duration: {c.durationDays} days | Price: ${c.price} | Max: {c.maxStudent}
              </Typography>
              <Typography color="text.secondary">Topics: {(c.topics || []).join(", ") || "—"}</Typography>
            </CardContent>
            <CardActions>
              <Button startIcon={<EditIcon />} onClick={() => startEdit(c)}>Edit</Button>
              <Button onClick={() => viewStudents(c)}>View Students</Button>
              <IconButton onClick={() => handleDelete(c._id)}><DeleteIcon /></IconButton>
            </CardActions>
          </Card>
        ))}
        {courses.length === 0 && <Typography>No courses yet. Create one above.</Typography>}
      </Box>

      <Dialog open={!!studentsOf} onClose={() => setStudentsOf(null)}>
        <DialogTitle>Enrolled Students — {studentsOf?.name}</DialogTitle>
        <DialogContent>
          <List>
            {students.map((s) => (
              <ListItem key={s.studentId}>
                <ListItemText primary={s.username} secondary={s.email} />
              </ListItem>
            ))}
            {students.length === 0 && <ListItem><ListItemText primary="No students enrolled yet" /></ListItem>}
          </List>
        </DialogContent>
      </Dialog>
    </Container>
  );
}

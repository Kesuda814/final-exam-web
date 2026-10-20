//src/pages/LoginPage.jsx

import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container, Box, TextField, Button, Typography, Alert, Paper,
} from "@mui/material";
import {UserContext} from "../context/UserContext.jsx";

export default function LoginPage() {
  const { user, login } = useContext(UserContext);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const u = await login(username, password);
      navigate(u.role === "Teacher" ? "/teacher" : "/student");
    } catch (err) {
      setError(err.message);
    }
  }

  if (user) {
    navigate(user.role === "Teacher" ? "/teacher" : "/student");
  }

  return (
    <Container maxWidth="sm">
      <Paper sx={{ mt: 10, p: 4 }}>
        <Typography variant="h5" gutterBottom>Login</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Username" fullWidth margin="normal" value={username}
            onChange={(e) => setUsername(e.target.value)} required
          />
          <TextField
            label="Password" type="password" fullWidth margin="normal"
            value={password} onChange={(e) => setPassword(e.target.value)} required
          />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            Login
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

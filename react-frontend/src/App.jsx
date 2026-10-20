//src/App.jsx

import { HashRouter, Route, Routes, Navigate } from "react-router-dom";
import { useContext } from "react";
import LoginPage from "./pages/LoginPage.jsx";
import TeacherCoursesPage from "./pages/TeacherCoursesPage.jsx";
import StudentCoursesPage from "./pages/StudentCoursesPage.jsx";
import StudentEnrollmentsPage from "./pages/StudentEnrollmentsPage.jsx";
import  UserContext  from "./context/UserContext.jsx";

function Protected({ roles, children }) {
  const { user, loading } = useContext(UserContext);
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return (
      <Navigate to={user.role === "Teacher" ? "/teacher" : "/student"} replace />
    );
  }
  return children;
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/teacher"
          element={
            <Protected roles={["Teacher"]}>
              <TeacherCoursesPage />
            </Protected>
          }
        />
        <Route
          path="/student"
          element={
            <Protected roles={["Student"]}>
              <StudentCoursesPage />
            </Protected>
          }
        />
        <Route
          path="/my-enrollments"
          element={
            <Protected roles={["Student"]}>
              <StudentEnrollmentsPage />
            </Protected>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </HashRouter>
  );
}

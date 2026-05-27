// ═════════════════════════════════════════════════════════════════
//  App.jsx — Route definitions for Founder Assist
// ═════════════════════════════════════════════════════════════════
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Layout
import DashboardLayout from "./layout/DashboardLayout";

// Pages
import Landing        from "./pages/Landing";
import Login          from "./pages/Login";
import Register       from "./pages/Register";
import Dashboard      from "./pages/Dashboard";
import Tasks          from "./pages/Tasks";
import Documents      from "./pages/Documents";
import Meetings       from "./pages/Meetings";
import AIChat         from "./pages/AIChat";
import Health         from "./pages/Health";
import Profile        from "./pages/Profile";
import StartupSettings from "./pages/StartupSettings";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import Loader         from "./components/Loader";

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
           style={{ background: "var(--bg-base)" }}>
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/"         element={<Landing />} />
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected dashboard routes */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard"        element={<Dashboard />} />
        <Route path="/tasks"            element={<Tasks />} />
        <Route path="/documents"        element={<Documents />} />
        <Route path="/meetings"         element={<Meetings />} />
        <Route path="/ai"               element={<AIChat />} />
        <Route path="/health"           element={<Health />} />
        <Route path="/profile"          element={<Profile />} />
        <Route path="/startup-settings" element={<StartupSettings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
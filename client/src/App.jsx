import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { useAuth } from "./contexts/authContext";
import { api } from "./services/api";
import { useTheme } from "./contexts/themeContext";

//auth
import AuthForm from "./pages/AuthForm";

//layouts
import AdminLayout from "./components/layout/AdminLayout";
import BranchesPage from "./pages/admin/BranchesPage";
import EmployeesPage from "./pages/admin/EmployeesPage";
import SettingsPage from "./pages/admin/SettingsPage";
import NotificationsPage from "./pages/admin/NotificationsPage";

// admin
import AdminDashboard from "./pages/admin/AdminDashboard";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-base-100 text-base-content">
        <span className="loading loading-spinner loading-xl"></span>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  // Normalize role to lowercase for comparison
  const userRole = user.role?.toLowerCase();
  const required = Array.isArray(requiredRole)
    ? requiredRole.map(r => r.toLowerCase())
    : requiredRole
      ? [requiredRole.toLowerCase()]
      : [];

  if (required.length > 0 && !required.includes(userRole)) {
    console.warn(`Access denied. User role: ${user.role}, Required: ${requiredRole}`);
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();

  const [locations, setLocations] = useState([]);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const formatDate = (date) => {
    const dateOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(date).toLocaleDateString("en-US", dateOptions);
  };
  const [isRegistered, setIsRegistered] = useState(false);
  const registrationCheckRoles = [
    "driver",
    "sales",
    "dispatch1",
    "dispatch2",
    "manager",
    "rider",
  ];

  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  useEffect(() => {
    if (!user) return;

    // fetchLocations();
    // getUnreadCount();
  }, [user]);

  const fetchLocations = async () => {
      try {
        const res = await api.get("/locations");
        setLocations(res.data.locations);
      } catch (error) {
        console.log("Failed to fetch location data: ", error.message);
      }
    };

  const handleSidebarToggle = () => {
    setIsCollapsed((prev) => !prev);
  };

  const getUnreadCount = async () => {
    if (!user) return;

    try {
      const res = await api.get("/notifications/unread", {
        params: { filter: "unread" },
      });
      setUnreadNotifications(res.data.total || 0);
    } catch (error) {
      console.log("Error fetching unread count:", error.message);
    }
  };

  // Show global loading if auth is loading
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-base-100 text-base-content">
        <span className="loading loading-spinner loading-xl"></span>
      </div>
    );
  }

  const roleRoutes = {
    Admin: "/admin",
    Driver: "/driver",
    Sales: "/sales",
    Dispatch1_Picking: "/dispatch/picking",
    Dispatch2_Packaging: "/dispatch/packaging",
    Dispatch2_Manager: "/dispatch/manager",
    Logistics: "/logistics",
    Driver: "/driver",
    Sales: "/sales",
  };

  return (
    <div data-theme={theme}>
      <div>
        <Toaster position="top-center" reverseOrder={false} />
      </div>

      <Routes>
        {/* Root route with proper loading & auth handling */}
        <Route
          path="/"
          element={
            !user ? (
              <Navigate to="/auth" replace />
            ) : (
              <Navigate to={roleRoutes[user.role] || "/admin"} replace />
            )
          }
        />

        {/* <Route path="/reset-password" element={<ResetPassword />} /> */}
        <Route path="/auth" element={<AuthForm />} />

        {/* Admin dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="Admin">
              <AdminLayout
                unreadNotifications={unreadNotifications}
                toggleSidebar={handleSidebarToggle}
              />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={<AdminDashboard toggleSidebar={handleSidebarToggle} />}
          />

          <Route
            path="branches"
            element={<BranchesPage toggleSidebar={handleSidebarToggle} />}
          />
          
          <Route
            path="employees"
            element={<EmployeesPage toggleSidebar={handleSidebarToggle} />}
          />

          <Route
            path="settings"
            element={<SettingsPage toggleSidebar={handleSidebarToggle} />}
          />

          <Route
            path="notifications"
            element={<NotificationsPage toggleSidebar={handleSidebarToggle} />}
          />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
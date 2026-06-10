import React, { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  Building2,
  Users,
  PackageCheck,
  ClipboardList,
  Truck,
  UserCog,
  BarChart3,
  Settings,
  Bell,
  Search,
  ChevronDown,
  Menu,
  Check,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  X,
  CircleCheck,
  Package,
  AlertTriangle,
  Info,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";
import { useAuth } from "../../contexts/authContext";
import { api } from "../../services/api";
import { useNotifications } from "../../contexts/notificationsContext";
import Sidebar from "../ui/Sidebar";
import NotificationsModal from "../ui/NotificationsModal";
import NavbarToggleButton from "../ui/NavbarToggleButton";
import BranchSelector from "../ui/BranchSelector";

/* Main AdminLayout */
export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Notification state
  const { unreadCount, notifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [showModal, setShowModal] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Toggle handler for the navbar button
  const handleNavbarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
    if (!isSidebarCollapsed && window.innerWidth < 1024) {
      setDrawerOpen(false);
    }
  };

  // Notification handlers
  const handleMarkAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: 1 } : n)
    );
  };

  const handleDelete = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, is_read: 1 }))
    );
  };

  const handleLogout = async () => {
    try {
      const res = await api.post("/auth/logout");
      toast.success(res.data.message);
      logout();
      navigate("/auth");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("admin-sidebar-collapsed");
    if (saved !== null) {
      setIsSidebarCollapsed(saved === "true");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("admin-sidebar-collapsed", String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  return (
    <div className="drawer lg:drawer-open h-screen overflow-hidden bg-base-300">
      <input
        id="admin-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={drawerOpen}
        onChange={() => setDrawerOpen(!drawerOpen)}
      />

      {/* Sidebar */}
      <div className="drawer-side">
        <label htmlFor="admin-drawer" className="drawer-overlay"></label>
        <div className="hidden lg:block">
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onClose={() => setDrawerOpen(false)}
            unreadCount={unreadCount}
          />
        </div>
        <div className="lg:hidden">
          <Sidebar isCollapsed={false} onClose={() => setDrawerOpen(false)} />
        </div>
      </div>

      {/* Main Content */}
      <div className="drawer-content flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-base-100 border-b border-base-300 h-16 flex items-center px-4 lg:px-6 z-30 shadow-sm">
          <div className="flex-1 flex items-center gap-4">
            <label
              htmlFor="admin-drawer"
              className="lg:hidden btn btn-ghost btn-square"
            >
              <Menu size={26} />
            </label>

            <div className="hidden lg:block">
              <NavbarToggleButton
                isCollapsed={isSidebarCollapsed}
                onToggle={handleNavbarToggle}
              />
            </div>

            <BranchSelector />
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications Bell Button with Modal */}
            <button 
              className="btn btn-ghost btn-circle relative"
              onClick={() => setShowModal(true)}
            >
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-0 rounded-full font-semibold h-4.5 w-4.5 badge badge-error badge-xs">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                className="btn btn-ghost flex items-center gap-2 px-2 cursor-pointer"
              >
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    JM
                  </div>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">{user.name || "Jane Doe"}</p>
                  <p className="text-xs text-base-content/60">{user.role || "Admin"}</p>
                </div>
              </div>

              <ul
                tabIndex={0}
                className="dropdown-content menu bg-base-100 border border-base-300 rounded-box w-52 p-2 shadow-lg z-10"
              >
                <li>
                  <a className="hover:bg-base-200 rounded-lg">Settings</a>
                </li>
                <li className="border-t border-base-300 mt-1 pt-1">
                  <a onClick={() => handleLogout()} className="text-error hover:bg-error/10 rounded-lg">
                    Logout
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-base-300 p-5 lg:p-8 transition-all duration-300">
          <Outlet />
        </main>
      </div>

      {/* Notifications Modal */}
      <NotificationsModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onDelete={(id) => handleDelete(id)}
      />
    </div>
  );
}
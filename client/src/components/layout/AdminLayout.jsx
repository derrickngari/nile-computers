import React, { useState, useRef, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
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

const BRANCHES = [
  { id: "all", label: "All Branches", location: "All Locations" },
  { id: "nbi", label: "Nairobi HQ", location: "Nairobi, Kenya" },
  { id: "msa", label: "Mombasa", location: "Mombasa, Kenya" },
  { id: "kis", label: "Kisumu", location: "Kisumu, Kenya" },
  { id: "nkr", label: "Nakuru", location: "Nakuru, Kenya" },
];

const NAV = [
  {
    section: "Workspace",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/admin", end: true },
      { label: "Orders", icon: ShoppingCart, path: "/admin/orders", badge: 12 },
      { label: "Inventory", icon: Boxes, path: "/admin/inventory" },
      { label: "Branches", icon: Building2, path: "/admin/branches" },
      { label: "Customers", icon: Users, path: "/admin/customers" },
    ],
  },
  {
    section: "Operations",
    items: [
      {
        label: "Procurement",
        icon: PackageCheck,
        path: "/admin/procurement",
        badge: 3,
      },
      {
        label: "Dispatch Center",
        icon: ClipboardList,
        path: "/admin/dispatch",
      },
      { label: "Logistics", icon: Truck, path: "/admin/logistics" },
      { label: "Employees", icon: UserCog, path: "/admin/employees" },
    ],
  },
  {
    section: "System",
    items: [
      { label: "Reports", icon: BarChart3, path: "/admin/reports" },
      { label: "Settings", icon: Settings, path: "/admin/settings" },
      { label: "Notifications", icon: Bell, path: "/admin/notifications", unread: 3 },
    ],
  },
];

// Mock notification data
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    user_id: 1,
    title: "New Order #ORD-1234",
    message: "Customer John Doe placed a new order worth KES 12,500. Awaiting confirmation.",
    receiver: "admin",
    type: "order",
    is_read: false,
    created_at: "2025-05-30 09:30:00",
    updated_at: "2025-05-30 09:30:00",
  },
  {
    id: 2,
    user_id: 1,
    title: "Low Stock Alert",
    message: "Product 'iPhone 15 Pro' has only 3 units left in Nairobi branch.",
    receiver: "admin",
    type: "inventory",
    is_read: false,
    created_at: "2025-05-30 08:15:00",
    updated_at: "2025-05-30 08:15:00",
  },
  {
    id: 3,
    user_id: 1,
    title: "System Update",
    message: "Scheduled maintenance on June 1st, 2025 from 2 AM to 4 AM EAT.",
    receiver: "admin",
    type: "system",
    is_read: true,
    created_at: "2025-05-29 14:00:00",
    updated_at: "2025-05-29 16:00:00",
  },
  {
    id: 4,
    user_id: 1,
    title: "Order #ORD-1230 Delivered",
    message: "Order #ORD-1230 has been successfully delivered to customer.",
    receiver: "admin",
    type: "order",
    is_read: true,
    created_at: "2025-05-29 10:00:00",
    updated_at: "2025-05-29 11:00:00",
  },
  {
    id: 5,
    user_id: 1,
    title: "New Customer Registration",
    message: "A new customer account has been created: Mary Wanjiku",
    receiver: "admin",
    type: "system",
    is_read: false,
    created_at: "2025-05-28 16:45:00",
    updated_at: "2025-05-28 16:45:00",
  },
];

/* Notifications Modal */
function NotificationsModal({ isOpen, onClose, notifications, onMarkAsRead, onDelete, onMarkAllAsRead }) {
  const [filter, setFilter] = useState("all"); // all, unread, order, inventory, system
  const modalRef = useRef(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target) && isOpen) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getTypeIcon = (type) => {
    switch (type) {
      case "order":
        return <Package size={16} className="text-blue-500" />;
      case "inventory":
        return <PackageCheck size={16} className="text-amber-500" />;
      case "system":
        return <Info size={16} className="text-purple-500" />;
      default:
        return <Bell size={16} className="text-gray-500" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "order":
        return "badge-primary";
      case "inventory":
        return "badge-warning";
      case "system":
        return "badge-secondary";
      default:
        return "badge-ghost";
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "unread") return !notif.is_read;
    if (filter === "order") return notif.type === "order";
    if (filter === "inventory") return notif.type === "inventory";
    if (filter === "system") return notif.type === "system";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 pointer-events-none">
      <div 
        ref={modalRef}
        className="w-full max-w-lg bg-base-100 rounded-2xl shadow-2xl pointer-events-auto animate-in slide-in-from-top-2 fade-in duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell size={22} className="text-primary" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-error text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold">Notifications</h2>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X size={18} />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 p-3 border-b border-base-200 bg-base-200/50">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
              filter === "all"
                ? "bg-primary text-primary-content shadow-sm"
                : "hover:bg-base-300 text-base-content/70"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
              filter === "unread"
                ? "bg-primary text-primary-content shadow-sm"
                : "hover:bg-base-300 text-base-content/70"
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter("order")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 flex items-center gap-1 ${
              filter === "order"
                ? "bg-primary text-primary-content shadow-sm"
                : "hover:bg-base-300 text-base-content/70"
            }`}
          >
            <Package size={12} /> Orders
          </button>
          <button
            onClick={() => setFilter("inventory")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 flex items-center gap-1 ${
              filter === "inventory"
                ? "bg-primary text-primary-content shadow-sm"
                : "hover:bg-base-300 text-base-content/70"
            }`}
          >
            <AlertTriangle size={12} /> Inventory
          </button>
          <button
            onClick={() => setFilter("system")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 flex items-center gap-1 ${
              filter === "system"
                ? "bg-primary text-primary-content shadow-sm"
                : "hover:bg-base-300 text-base-content/70"
            }`}
          >
            <Info size={12} /> System
          </button>
        </div>

        {/* Actions Bar */}
        {notifications.length > 0 && unreadCount > 0 && (
          <div className="flex justify-end p-3 border-b border-base-200">
            <button
              onClick={onMarkAllAsRead}
              className="btn btn-ghost btn-xs gap-1 text-primary hover:bg-primary/10"
            >
              <Eye size={12} />
              Mark all as read
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-base-300">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Bell size={48} className="text-base-content/20 mb-3" />
              <p className="text-base-content/50 text-sm">No notifications</p>
              <p className="text-base-content/30 text-xs mt-1">
                {filter !== "all" ? `No ${filter} notifications found` : "You're all caught up!"}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`group relative border-b border-base-200 hover:bg-base-200/50 transition-all duration-200 ${
                  !notif.is_read ? "bg-primary/5" : ""
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center shrink-0">
                      {getTypeIcon(notif.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`text-sm font-medium ${!notif.is_read ? "text-primary" : ""}`}>
                          {notif.title}
                        </p>
                        <span className={`badge badge-xs ${getTypeColor(notif.type)}`}>
                          {notif.type}
                        </span>
                        {!notif.is_read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        )}
                      </div>
                      <p className="text-xs text-base-content/60 mt-1 line-clamp-2">
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <p className="text-[10px] text-base-content/40">
                          {formatDate(notif.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {!notif.is_read && (
                        <button
                          onClick={() => onMarkAsRead(notif.id)}
                          className="btn btn-ghost btn-xs btn-circle text-primary"
                          title="Mark as read"
                        >
                          <Eye size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(notif.id)}
                        className="btn btn-ghost btn-xs btn-circle text-error"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-base-200 text-center">
            <p className="text-[10px] text-base-content/40">
              Showing {filteredNotifications.length} of {notifications.length} notifications
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function BranchSelector({ selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="btn btn-outline btn-primary btn-sm gap-2 min-w-[160px] justify-between"
      >
        <div className="flex flex-col items-start gap-0">
          <span className="text-xs font-medium">{selected.label}</span>
          {/* <span className="text-[10px] text-base-content/50">
            {selected.location}
          </span> */}
        </div>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-72 bg-base-100 border border-base-300 rounded-box shadow-2xl">
          <div className="p-2">
            <div className="px-3 py-2 mb-1">
              <p className="text-xs font-bold uppercase tracking-wider text-base-content/60">
                Select Branch
              </p>
            </div>
            <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-base-300">
              {BRANCHES.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    onChange(b);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 group
                    ${
                      selected.id === b.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-base-200"
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm font-medium ${selected.id === b.id ? "text-primary" : ""}`}
                        >
                          {b.label}
                        </p>
                        {selected.id === b.id && (
                          <Check size={14} className="text-primary" />
                        )}
                      </div>
                      {/* <p className="text-xs text-base-content/50 mt-0.5">
                        {b.location}
                      </p> */}
                    </div>
                    {selected.id === b.id && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Navbar Toggle Button */
function NavbarToggleButton({ isCollapsed, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="btn outline-0 bg-transparent border-0 btn-sm gap-2 transition-all duration-200 hover:bg-base-200"
      aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      title={
        isCollapsed ? "Show sidebar navigation" : "Hide sidebar navigation"
      }
    >
      {isCollapsed ? (
        <PanelLeftOpen size={18} className="text-primary" />
      ) : (
        <PanelLeftClose size={18} />
      )}
    </button>
  );
}

/* Sidebar */
function Sidebar({ onClose, isCollapsed }) {
  // State for expanded/collapsed sections
  const [expandedSections, setExpandedSections] = useState(() => {
    // Initialize all sections as expanded by default
    const saved = localStorage.getItem("sidebar-expanded-sections");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    }
    // Default: all sections expanded
    const initial = {};
    NAV.forEach((group) => {
      initial[group.section] = true;
    });
    return initial;
  });

  // Save expanded sections to localStorage when changed
  useEffect(() => {
    localStorage.setItem("sidebar-expanded-sections", JSON.stringify(expandedSections));
  }, [expandedSections]);

  const toggleSection = (sectionName) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  // When collapsed, we don't show section headers or toggles, just icons
  if (isCollapsed) {
    return (
      <aside
        className={`h-screen bg-base-200 border-r border-base-300 flex flex-col transition-all duration-300 ease-in-out overflow-hidden w-20`}
      >
        {/* Logo - Fixed at top */}
        <div className="h-16 border-b border-base-300 flex items-center justify-center px-2 shrink-0">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shrink-0">
            <Boxes size={24} className="text-primary-content" />
          </div>
        </div>

        {/* Scrollable Menu Items - Icon only */}
        <div className="flex-1 overflow-y-auto hide-scrollbar min-h-0">
          <nav className="px-2 py-4">
            {NAV.map((group) => (
              <div key={group.section} className="mb-6">
                <ul className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const hasBadge =
                      item.badge !== undefined && item.badge !== null;

                    return (
                      <li key={item.path} className="relative">
                        <NavLink
                          to={item.path}
                          end={item.end}
                          onClick={onClose}
                          className={({ isActive }) =>
                            `flex items-center justify-center transition-all duration-200 rounded-xl text-sm font-medium relative py-3 px-0
                             ${
                               isActive
                                 ? "bg-primary text-primary-content shadow-md"
                                 : "hover:bg-base-300 text-base-content"
                             }`
                          }
                          title={item.label}
                        >
                          <div className="relative">
                            <Icon size={20} className="shrink-0" />
                            {/* Blue dot for collapsed mode when badge exists */}
                            {hasBadge && (
                              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full ring-2 ring-base-200"></span>
                            )}
                            {item.unread !== undefined && item.unread > 0 && (
                              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-error rounded-full ring-2 ring-base-200"></span>
                            )}
                          </div>
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t border-base-300 shrink-0 p-2">
          <div className="bg-base-300 rounded-2xl flex items-center justify-center p-3">
            <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse shrink-0"></div>
          </div>
        </div>
      </aside>
    );
  }

  // Expanded mode with collapsible sections
  return (
    <aside
      className={`h-screen bg-base-200 border-r border-base-300 flex flex-col transition-all duration-300 ease-in-out overflow-hidden w-62`}
    >
      {/* Logo - Fixed at top */}
      <div className="h-16 border-b border-base-300 flex items-center px-5 gap-3 shrink-0">
        <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shrink-0">
          <Boxes size={24} className="text-primary-content" />
        </div>
        <div className="overflow-hidden whitespace-nowrap">
          <p className="font-bold text-xl tracking-tight">Nile Ops</p>
          <p className="text-xs text-base-content/60">Operations Suite</p>
        </div>
      </div>

      {/* Scrollable Menu Items with collapsible sections */}
      <div className="flex-1 overflow-y-auto hide-scrollbar min-h-0">
        <nav className="p-4 space-y-2">
          {NAV.map((group) => {
            const isExpanded = expandedSections[group.section];
            return (
              <div key={group.section} className="space-y-1">
                {/* Collapsible Section Header */}
                <button
                  onClick={() => toggleSection(group.section)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-base-300 transition-all duration-200 group"
                >
                  <p className="uppercase text-xs font-bold tracking-wider text-base-content/60">
                    {group.section}
                  </p>
                  <ChevronRight
                    size={14}
                    className={`text-base-content/50 transition-transform duration-200 ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                </button>

                {/* Section Items - Collapsible */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <ul className="space-y-1 pl-2">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const hasBadge =
                        item.badge !== undefined && item.badge !== null;

                      return (
                        <li key={item.path} className="relative">
                          <NavLink
                            to={item.path}
                            end={item.end}
                            onClick={onClose}
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                               ${
                                 isActive
                                   ? "bg-primary text-primary-content shadow-md"
                                   : "hover:bg-base-300 text-base-content"
                               }`
                            }
                          >
                            <Icon size={20} className="shrink-0" />
                            <span className="flex-1">{item.label}</span>
                            {hasBadge && (
                              <span className="badge badge-primary rounded-full w-6 h-6 badge-sm font-medium">
                                {item.badge}
                              </span>
                            )}
                            {item.unread !== undefined && item.unread > 0 && (
                              <span className="badge badge-error rounded-full w-6 h-6 badge-sm font-medium">
                                {item.unread > 90 ? "99+" : item.unread}
                              </span>
                            )}
                          </NavLink>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="border-t border-base-300 shrink-0 p-4">
        <div className="bg-base-300 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse shrink-0"></div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium whitespace-nowrap">
              All systems operational
            </p>
            <p className="text-xs text-base-content/60 whitespace-nowrap">
              Last synced moments ago
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* Main AdminLayout */
export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [branch, setBranch] = useState(BRANCHES[0]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Notification state
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

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

  const unreadCount = notifications.filter(n => !n.is_read).length;

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

            <BranchSelector selected={branch} onChange={setBranch} />
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications Bell Button with Modal */}
            <button
              onClick={() => setNotificationsModalOpen(true)}
              className="btn btn-ghost btn-circle relative"
              aria-label="View notifications"
            >
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-error text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                  {unreadCount}
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
                  <p className="text-sm font-medium">James Mwendwa</p>
                  <p className="text-xs text-base-content/60">Admin</p>
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
                  <a className="text-error hover:bg-error/10 rounded-lg">
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
        isOpen={notificationsModalOpen}
        onClose={() => setNotificationsModalOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onDelete={handleDelete}
        onMarkAllAsRead={handleMarkAllAsRead}
      />
    </div>
  );
}
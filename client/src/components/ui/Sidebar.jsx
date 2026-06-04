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
import { useAuth } from "../../contexts/authContext";
import { useNotifications } from "../../contexts/notificationsContext";

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

export default function Sidebar({ onClose, isCollapsed, unreadCount }) {
  const [expandedSections, setExpandedSections] = useState(() => {
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

  useEffect(() => {
    localStorage.setItem("sidebar-expanded-sections", JSON.stringify(expandedSections));
  }, [expandedSections]);

  const toggleSection = (sectionName) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  if (isCollapsed) {
    return (
      <aside
        className={`h-screen bg-base-200 border-r border-base-300 flex flex-col transition-all duration-300 ease-in-out overflow-hidden w-20`}
      >
        {/* Logo */}
        <div className="h-16 border-b border-base-300 flex items-center justify-center px-2 shrink-0">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shrink-0">
            <Boxes size={24} className="text-primary-content" />
          </div>
        </div>

        {/* Scrollable Menu Items*/}
        <div className="flex-1 overflow-y-auto hide-scrollbar min-h-0">
          <nav className="px-2 py-4">
            {NAV.map((group) => (
              <div key={group.section} className="mb-6">
                <ul className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const hasBadge = item.badge !== undefined && item.badge !== null;

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
                            {/*  */}
                            {hasBadge && (
                              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full ring-2 ring-base-200"></span>
                            )}
                            {unreadCount > 0 && item.label === "Notifications" && (
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
          <p className="font-bold text-xl tracking-tight">Nile Computers</p>
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

                {/* Section Items */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <ul className="space-y-1 pl-2">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const hasBadge = item.badge !== undefined && item.badge !== null;

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
                            {unreadCount > 0 && item.label === "Notifications" && (
                              <span className="badge badge-error rounded-full w-6 h-6 badge-sm font-medium">
                                {unreadCount > 90 ? "99+" : unreadCount}
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
import React, { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  Bell,
  Check,
  X,
  CircleCheck,
  Package,
  PackageCheck,
  Info,
  Eye,
  EyeOff,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../../contexts/authContext";
import { useNotifications } from "../../contexts/notificationsContext";

export default function NotificationsModal({ isOpen, onClose, notifications, onMarkAsRead, onDelete, onMarkAllAsRead }) {
  const [filter, setFilter] = useState("all"); 
  const modalRef = useRef(null);

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
        <div className="flex w-full no-scrollbar gap-1 p-3 overflow-x-auto border-b border-base-200 bg-base-200/50">
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
              className="btn btn-ghost btn-outline btn-xs gap-1 text-primary hover:bg-primary/10"
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
                    <div className="flex items-center gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200">
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
};
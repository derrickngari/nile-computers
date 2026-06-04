import React, { useState, useEffect } from "react";
import { 
  Bell, Package, AlertTriangle, Info, CheckCircle2, Trash2, Search 
} from "lucide-react";
import { useNotifications } from "../../contexts/notificationsContext";

export default function NotificationsPage() {
  const { 
    notifications = [], 
    unreadCount = 0, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();

  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredNotifications = notifications
    .filter((notif) => {
      const matchesSearch = 
        notif.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notif.message?.toLowerCase().includes(searchTerm.toLowerCase());

      if (filter === "unread") return !notif.is_read && matchesSearch;
      if (filter === "order") return notif.type === "order" && matchesSearch;
      if (filter === "inventory") return notif.type === "inventory" && matchesSearch;
      if (filter === "system") return notif.type === "system" && matchesSearch;
      return matchesSearch;
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const getTypeIcon = (type) => {
    switch (type) {
      case "order": return <Package size={20} className="text-blue-500" />;
      case "inventory": return <AlertTriangle size={20} className="text-amber-500" />;
      case "system": return <Info size={20} className="text-purple-500" />;
      default: return <Bell size={20} className="text-gray-500" />;
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-base-content/70">Stay updated with important alerts</p>
        </div>

        <button 
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="btn btn-primary flex items-center gap-2"
        >
          <CheckCircle2 size={18} />
          Mark all as read
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">Total</div>
          <div className="stat-value">{notifications.length}</div>
        </div>
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">Unread</div>
          <div className="stat-value text-primary">{unreadCount}</div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="flex flex-col md:flex-row gap-4">
            <label className="input input-bordered flex items-center gap-2 flex-1">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </label>

            <div className="flex gap-2">
              {["all", "unread", "order", "inventory", "system"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`btn btn-sm capitalize ${filter === f ? "btn-primary" : "btn-ghost"}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="card bg-base-100 shadow">
        <div className="card-body p-0">
          {loading ? (
            <div className="py-20 flex justify-center">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-20 text-center text-base-content/60">
              No notifications found
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-5 flex gap-4 border-b border-base-200 hover:bg-base-200/50 transition-all ${
                  !notif.is_read ? "bg-primary/5" : ""
                }`}
              >
                <div className="mt-1">{getTypeIcon(notif.type)}</div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-semibold ${!notif.is_read ? "text-primary" : ""}`}>
                      {notif.title}
                    </h3>
                    {!notif.is_read && <span className="badge badge-primary badge-xs">New</span>}
                  </div>

                  <p className="text-sm text-base-content/70 mt-1">{notif.message}</p>
                  <p className="text-xs text-base-content/50 mt-3">
                    {formatDate(notif.created_at)}
                  </p>
                </div>

                <div className="flex gap-2">
                  {!notif.is_read && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="btn btn-ghost btn-sm btn-circle text-primary"
                    >
                      <CheckCircle2 size={18} />
                    </button>
                  )}

                  <button
                    onClick={() => deleteNotification(notif.id)}
                    className="btn btn-ghost btn-sm btn-circle text-error"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
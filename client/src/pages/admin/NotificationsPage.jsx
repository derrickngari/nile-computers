import React, { useState } from "react";
import {
  Bell,
  Package,
  AlertTriangle,
  Info,
  CheckCircle2,
  Trash2,
  Search,
} from "lucide-react";

const notificationsData = [
  {
    id: 1,
    title: "New Order #ORD-1234",
    message: "Customer John Doe placed a new order worth KES 12,500.",
    type: "order",
    read: false,
    date: "10 mins ago",
  },
  {
    id: 2,
    title: "Low Stock Alert",
    message: "MikroTik RB4011 has only 2 units remaining.",
    type: "inventory",
    read: false,
    date: "1 hour ago",
  },
  {
    id: 3,
    title: "System Maintenance",
    message: "System maintenance scheduled for Sunday 2AM.",
    type: "system",
    read: true,
    date: "Yesterday",
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] =
    useState(notificationsData);

  const unreadCount = notifications.filter(
    (n) => !n.read
  ).length;

  const markRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  const remove = (id) => {
    setNotifications((prev) =>
      prev.filter((n) => n.id !== id)
    );
  };

  const getIcon = (type) => {
    switch (type) {
      case "order":
        return <Package size={18} />;
      case "inventory":
        return <AlertTriangle size={18} />;
      default:
        return <Info size={18} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            Notifications
          </h1>

          <p className="text-base-content/60">
            Manage alerts and system messages
          </p>
        </div>

        <div className="btn btn-primary rounded-lg">
          Mark all as read
        </div>
      </div>

      {/* Stats */}

      <div className="grid md:grid-cols-4 gap-4">
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">
            Total Notifications
          </div>
          <div className="stat-value">
            {notifications.length}
          </div>
        </div>

        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">Unread</div>
          <div className="stat-value text-primary">
            {unreadCount}
          </div>
        </div>

        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">Orders</div>
          <div className="stat-value">
            {
              notifications.filter(
                (n) => n.type === "order"
              ).length
            }
          </div>
        </div>

        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">
            Inventory Alerts
          </div>
          <div className="stat-value">
            {
              notifications.filter(
                (n) => n.type === "inventory"
              ).length
            }
          </div>
        </div>
      </div>

      {/* Search */}

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <label className="input input-bordered flex items-center gap-2">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search notifications..."
            />
          </label>
        </div>
      </div>

      {/* Notifications List */}

      <div className="card bg-base-100 shadow">
        <div className="card-body p-0">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`border-b border-base-300 p-4 flex gap-4 ${
                !n.read
                  ? "bg-primary/5"
                  : ""
              }`}
            >
              <div className="bg-base-200 p-3 rounded-xl">
                {getIcon(n.type)}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">
                    {n.title}
                  </h3>

                  {!n.read && (
                    <div className="badge badge-primary badge-xs">
                      New
                    </div>
                  )}
                </div>

                <p className="text-sm opacity-70">
                  {n.message}
                </p>

                <p className="text-xs opacity-50 mt-2">
                  {n.date}
                </p>
              </div>

              <div className="flex gap-2">
                {!n.read && (
                  <button
                    onClick={() =>
                      markRead(n.id)
                    }
                    className="btn btn-ghost btn-sm"
                  >
                    <CheckCircle2 size={16} />
                  </button>
                )}

                <button
                  onClick={() =>
                    remove(n.id)
                  }
                  className="btn btn-ghost btn-sm text-error"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
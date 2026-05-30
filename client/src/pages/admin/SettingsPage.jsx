import React, { useState } from "react";
import {
  User,
  Bell,
  Shield,
  Building2,
  Save,
} from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    companyName: "Nile Ops",
    email: "admin@nileops.com",
    phone: "+254712345678",

    emailNotifications: true,
    smsNotifications: false,
    whatsappNotifications: true,

    require2FA: true,
  });

  const update = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}

      <div>
        <h1 className="text-3xl font-bold">
          Settings
        </h1>

        <p className="text-base-content/60">
          Configure company and system
          preferences
        </p>
      </div>

      {/* Company Settings */}

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={20} />
            <h2 className="text-lg font-semibold">
              Company Information
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              className="input input-bordered"
              value={settings.companyName}
              onChange={(e) =>
                update(
                  "companyName",
                  e.target.value
                )
              }
            />

            <input
              className="input input-bordered"
              value={settings.email}
              onChange={(e) =>
                update(
                  "email",
                  e.target.value
                )
              }
            />

            <input
              className="input input-bordered"
              value={settings.phone}
              onChange={(e) =>
                update(
                  "phone",
                  e.target.value
                )
              }
            />
          </div>
        </div>
      </div>

      {/* Notifications */}

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={20} />
            <h2 className="text-lg font-semibold">
              Notifications
            </h2>
          </div>

          <div className="space-y-4">
            <label className="flex justify-between items-center">
              <span>Email Notifications</span>

              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={
                  settings.emailNotifications
                }
                onChange={(e) =>
                  update(
                    "emailNotifications",
                    e.target.checked
                  )
                }
              />
            </label>

            <label className="flex justify-between items-center">
              <span>SMS Notifications</span>

              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={
                  settings.smsNotifications
                }
                onChange={(e) =>
                  update(
                    "smsNotifications",
                    e.target.checked
                  )
                }
              />
            </label>

            <label className="flex justify-between items-center">
              <span>
                WhatsApp Notifications
              </span>

              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={
                  settings.whatsappNotifications
                }
                onChange={(e) =>
                  update(
                    "whatsappNotifications",
                    e.target.checked
                  )
                }
              />
            </label>
          </div>
        </div>
      </div>

      {/* Security */}

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={20} />
            <h2 className="text-lg font-semibold">
              Security
            </h2>
          </div>

          <label className="flex justify-between items-center">
            <span>
              Require Two-Factor
              Authentication
            </span>

            <input
              type="checkbox"
              className="toggle toggle-success"
              checked={settings.require2FA}
              onChange={(e) =>
                update(
                  "require2FA",
                  e.target.checked
                )
              }
            />
          </label>
        </div>
      </div>

      {/* Profile */}

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="flex items-center gap-2 mb-4">
            <User size={20} />
            <h2 className="text-lg font-semibold">
              Profile
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-20">
                <span>JM</span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold">
                James Mwendwa
              </h3>

              <p className="text-sm opacity-60">
                System Administrator
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Save */}

      <div className="flex justify-end">
        <button className="btn btn-primary">
          <Save size={18} />
          Save Changes
        </button>
      </div>
    </div>
  );
}
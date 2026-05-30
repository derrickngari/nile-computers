import React, { useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  BadgeCheck,
  Building2,
  Clock3,
} from "lucide-react";

const employees = [
  {
    id: 1,
    name: "John Kamau",
    number: "EMP001",
    role: "Sales",
    branch: "Nairobi",
    phone: "0712345678",
    status: "Active",
    lastLogin: "2 mins ago",
  },
  {
    id: 2,
    name: "Mercy Wanjiku",
    number: "EMP002",
    role: "Dispatch1",
    branch: "Narok",
    phone: "0723456789",
    status: "Active",
    lastLogin: "15 mins ago",
  },
  {
    id: 3,
    name: "David Otieno",
    number: "EMP003",
    role: "Logistics",
    branch: "Kisumu",
    phone: "0734567890",
    status: "Offline",
    lastLogin: "Yesterday",
  },
];

const stats = [
  {
    title: "Employees",
    value: 84,
    icon: Users,
  },
  {
    title: "Sales Staff",
    value: 20,
    icon: BadgeCheck,
  },
  {
    title: "Dispatch Staff",
    value: 32,
    icon: Building2,
  },
  {
    title: "Online Now",
    value: 26,
    icon: Clock3,
  },
];

export default function EmployeesPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            Employees
          </h1>

          <p className="text-base-content/70">
            Manage employees and roles
          </p>
        </div>

        <button className="btn btn-primary">
          <UserPlus size={18} />
          Add Employee
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="card bg-base-100 shadow"
            >
              <div className="card-body">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-base-content/70">
                      {stat.title}
                    </p>

                    <h2 className="text-3xl font-bold">
                      {stat.value}
                    </h2>
                  </div>

                  <div className="bg-primary/10 p-3 rounded-xl">
                    <Icon
                      size={24}
                      className="text-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="flex flex-col gap-4 lg:flex-row">
            <label className="input input-bordered flex items-center gap-2 flex-1">
              <Search size={18} />
              <input
                placeholder="Search employee..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </label>

            <select className="select select-bordered">
              <option>All Roles</option>
              <option>Sales</option>
              <option>Dispatch1</option>
              <option>Dispatch2</option>
              <option>Logistics</option>
            </select>

            <select className="select select-bordered">
              <option>All Branches</option>
              <option>Nairobi</option>
              <option>Narok</option>
              <option>Kisumu</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Number</th>
                  <th>Role</th>
                  <th>Branch</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Last Login</th>
                </tr>
              </thead>

              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td className="font-medium">
                      {employee.name}
                    </td>

                    <td>{employee.number}</td>

                    <td>{employee.role}</td>

                    <td>{employee.branch}</td>

                    <td>{employee.phone}</td>

                    <td>
                      <div
                        className={`badge ${
                          employee.status ===
                          "Active"
                            ? "badge-success"
                            : "badge-ghost"
                        }`}
                      >
                        {employee.status}
                      </div>
                    </td>

                    <td>{employee.lastLogin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
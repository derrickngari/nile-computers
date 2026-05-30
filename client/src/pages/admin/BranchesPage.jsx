import React, { useState } from "react";
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Users,
  Package,
  MoreVertical,
} from "lucide-react";

const dummyBranches = [
  {
    id: 1,
    name: "Nairobi HQ",
    code: "NBI",
    city: "Nairobi",
    phone: "0712345678",
    employees: 35,
    ordersToday: 102,
    status: "Active",
  },
  {
    id: 2,
    name: "Narok Branch",
    code: "NRK",
    city: "Narok",
    phone: "0723456789",
    employees: 12,
    ordersToday: 28,
    status: "Active",
  },
  {
    id: 3,
    name: "Kisumu Branch",
    code: "KSM",
    city: "Kisumu",
    phone: "0734567890",
    employees: 8,
    ordersToday: 15,
    status: "Inactive",
  },
];

const stats = [
  {
    title: "Total Branches",
    value: 12,
    icon: Building2,
  },
  {
    title: "Active Branches",
    value: 10,
    icon: MapPin,
  },
  {
    title: "Employees",
    value: 84,
    icon: Users,
  },
  {
    title: "Orders Today",
    value: 248,
    icon: Package,
  },
];

export default function BranchesPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Branches</h1>
          <p className="text-base-content/70">
            Manage all company branches
          </p>
        </div>

        <button className="btn btn-primary">
          <Plus size={18} />
          Add Branch
        </button>
      </div>

      {/* Stats */}
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

      {/* Filters */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="flex flex-col gap-4 lg:flex-row">
            <label className="input input-bordered flex items-center gap-2 flex-1">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search branch..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </label>

            <select className="select select-bordered">
              <option>All Cities</option>
              <option>Nairobi</option>
              <option>Narok</option>
              <option>Kisumu</option>
            </select>

            <select className="select select-bordered">
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Branch</th>
                  <th>Code</th>
                  <th>City</th>
                  <th>Phone</th>
                  <th>Employees</th>
                  <th>Orders</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {dummyBranches.map((branch) => (
                  <tr key={branch.id}>
                    <td className="font-medium">
                      {branch.name}
                    </td>

                    <td>{branch.code}</td>

                    <td>{branch.city}</td>

                    <td>{branch.phone}</td>

                    <td>{branch.employees}</td>

                    <td>{branch.ordersToday}</td>

                    <td>
                      <div
                        className={`badge ${
                          branch.status === "Active"
                            ? "badge-success"
                            : "badge-error"
                        }`}
                      >
                        {branch.status}
                      </div>
                    </td>

                    <td>
                      <button className="btn btn-ghost btn-sm">
                        <MoreVertical size={18} />
                      </button>
                    </td>
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
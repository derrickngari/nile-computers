import React, { useState, useEffect } from "react";
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit3, 
  Power, 
  PowerOff, 
  X 
} from "lucide-react";
import { api } from "../../services/api";
import { toast } from "react-hot-toast";

export default function EmployeesPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: "",
    role: "",
    branch: ""
  });

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    employee_number: "",
    role_id: "",
    branch_id: "",
  });

  // Load filters & users
  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const loadFilters = async () => {
    try {
      const [rolesRes, branchesRes] = await Promise.all([
        api.get("/roles"),
        api.get("/branches")
      ]);
      setRoles(rolesRes.data);
      setBranches(branchesRes.data);
    } catch (err) {
      toast.error("Failed to load filters");
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users", { params: filters });
      setUsers(res.data);
    } catch (error) {
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      employee_number: "",
      role_id: "",
      branch_id: "",
    });
  };

  // Add Employee
  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/users", {
        ...formData,
        password: "12345678",
      });

      toast.success("Employee added successfully. Default password: 12345678");
      setShowAddModal(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add employee");
    }
  };

  // Edit Employee
  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      employee_number: user.employee_number,
      role_id: user.role_id || "",
      branch_id: user.branch_id || "",
    });
    setShowEditModal(true);
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/${editingUser.id}`, formData);
      toast.success("Employee updated successfully");
      setShowEditModal(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update employee");
    }
  };

  // Toggle Status
  const toggleUserStatus = async (id, currentActive) => {
    try {
      await api.patch(`/users/${id}/status`);
      toast.success("Status updated successfully");
      fetchUsers();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between flex-col gap-4 md:flex-row items-center">
        <div>
          <h1 className="text-3xl font-bold">Employees</h1>
          <p className="text-base-content/70">Manage your team members and access rights</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary flex items-center gap-2">
          <UserPlus size={18} />
          Add Employee
        </button>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="input input-bordered flex items-center gap-2">
              <Search size={18} />
              <input
                placeholder="Search by name or employee number..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </label>

            <select 
              className="select select-bordered"
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            >
              <option value="">All Roles</option>
              {roles.map(r => (
                <option key={r.id} value={r.name}>{r.name}</option>
              ))}
            </select>

            <select 
              className="select select-bordered"
              value={filters.branch}
              onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
            >
              <option value="">All Branches</option>
              {branches.map(b => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Employees Cards */}
      {loading ? (
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div key={user.id} className="card bg-base-100 shadow hover:shadow-md transition-all">
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <div className="avatar placeholder">
                    <div className="w-16 h-16 bg-primary text-primary-content rounded-2xl text-3xl font-bold flex items-center justify-center">
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleUserStatus(user.id, user.active)}
                    className={`btn btn-circle btn-sm ${user.active ? "btn-success" : "btn-ghost"}`}
                  >
                    {user.active ? <Power size={20} /> : <PowerOff size={20} />}
                  </button>
                </div>

                <div className="mt-4">
                  <h2 className="text-xl font-bold">
                    {user.first_name} {user.last_name}
                  </h2>
                  <p className="text-sm text-base-content/60">{user.employee_number}</p>
                </div>

                <div className="space-y-2 mt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Role</span>
                    <span className="font-medium">{user.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Branch</span>
                    <span className="font-medium">{user.branch}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Phone</span>
                    <span>{user.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Email</span>
                    <span className="text-xs break-all">{user.email}</span>
                  </div>
                </div>

                <div className="card-actions mt-6">
                  <button 
                    onClick={() => openEditModal(user)}
                    className="btn btn-outline btn-sm w-full flex items-center gap-2"
                  >
                    <Edit3 size={16} /> Edit Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="modal modal-open backdrop-blur-xs">
          <div className="modal-box max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-xl">Add New Employee</h3>
              <button onClick={() => setShowAddModal(false)} className="btn btn-ghost btn-circle">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="First Name" className="input input-bordered w-full" required
                  value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
                <input type="text" placeholder="Last Name" className="input input-bordered w-full" required
                  value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
              </div>

              <input type="email" placeholder="Email" className="input input-bordered w-full" required
                value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />

              <input type="tel" placeholder="Phone Number" className="input input-bordered w-full" required
                value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />

              <input type="text" placeholder="Employee Number" className="input input-bordered w-full" required
                value={formData.employee_number} onChange={(e) => setFormData({ ...formData, employee_number: e.target.value })} />

              <select className="select select-bordered w-full" required
                value={formData.role_id} onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}>
                <option value="">Select Role</option>
                {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>

              <select className="select select-bordered w-full" required
                value={formData.branch_id} onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}>
                <option value="">Select Branch</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>

              <div className="text-xs text-base-content/60 bg-base-200 p-3 rounded-lg">
                Default password will be set to: <strong>12345678</strong>
              </div>

              <div className="modal-action">
                <button type="button" className="btn" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Employee</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && editingUser && (
        <div className="modal modal-open backdrop-blur-xs">
          <div className="modal-box max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-xl">Edit Employee</h3>
              <button onClick={() => setShowEditModal(false)} className="btn btn-ghost btn-circle">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateEmployee} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input type="text" className="input input-bordered w-full" required
                  value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
                <input type="text" className="input input-bordered w-full" required
                  value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
              </div>

              <input type="email" className="input input-bordered w-full" required
                value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />

              <input type="tel" className="input input-bordered w-full" required
                value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />

              <input type="text" className="input input-bordered w-full" required
                value={formData.employee_number} onChange={(e) => setFormData({ ...formData, employee_number: e.target.value })} />

              <select className="select select-bordered w-full" required
                value={formData.role_id} onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}>
                {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>

              <select className="select select-bordered w-full" required
                value={formData.branch_id} onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>

              <div className="modal-action">
                <button type="button" className="btn" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Update Employee</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
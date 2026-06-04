import React, { useState, useEffect } from "react";
import {
  Building2,
  Plus,
  Search,
  Edit3,
  Power,
  PowerOff,
  X,
} from "lucide-react";
import { api } from "../../services/api";
import { toast } from "react-hot-toast";

export default function BranchesPage() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: "",
    city: "",
    status: "",
  });

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    fetchBranches();
  }, [filters]);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await api.get("/branches", { params: filters });
      setBranches(res.data);
    } catch (error) {
      toast.error("Failed to load branches");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      latitude: "",
      longitude: "",
    });
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name || "",
      code: branch.code || "",
      phone: branch.phone || "",
      email: branch.email || "",
      address: branch.address || "",
      city: branch.city || "",
      latitude: branch.latitude || "",
      longitude: branch.longitude || "",
    });
    setShowEditModal(true);
  };

  const handleAddBranch = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/branches", formData);
      toast.success(res.data.message || "Branch created successfully");
      setShowAddModal(false);
      resetForm();
      fetchBranches();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create branch");
    }
  };

  const handleUpdateBranch = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/branches/${editingBranch.id}`, formData);
      toast.success(res.data.message || "Branch updated successfully");
      setShowEditModal(false);
      fetchBranches();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update branch");
    }
  };

  const toggleBranchStatus = async (id, currentActive) => {
    try {
      const res = await api.patch(`/branches/${id}/status`);
      toast.success(res.data.message);
      fetchBranches();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update branch status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between flex-col gap-4 md:flex-row  items-center">
        <div>
          <h1 className="text-3xl font-bold">Branches</h1>
          <p className="text-base-content/70">Manage all company branches</p>
        </div>
        <button
          onClick={openAddModal}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Add New Branch
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-base-content/70">Total Branches</p>
                <h2 className="text-4xl font-bold mt-1">{branches.length}</h2>
              </div>
              <Building2 size={40} className="text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="input input-bordered flex items-center gap-2">
              <Search size={18} />
              <input
                placeholder="Search branch name or code..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
              />
            </label>

            <select
              className="select select-bordered"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            >
              <option value="">All Cities</option>
              <option value="Nairobi">Nairobi</option>
              <option value="Mombasa">Mombasa</option>
              <option value="Kisumu">Kisumu</option>
            </select>

            <select
              className="select select-bordered"
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
            >
              <option value="">All Status</option>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Branches Cards */}
      {loading ? (
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className="card bg-base-100 shadow hover:shadow-md transition-all"
            >
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <Building2 size={28} className="text-primary" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg">{branch.name}</h2>
                      <p className="text-sm text-base-content/60">
                        {branch.code}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleBranchStatus(branch.id, branch.active)}
                    className={`btn btn-circle btn-sm ${branch.active ? "btn-success" : "btn-ghost"}`}
                  >
                    {branch.active ? (
                      <Power size={20} />
                    ) : (
                      <PowerOff size={20} />
                    )}
                  </button>
                </div>

                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-base-content/60">City</span>
                    <span>{branch.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Phone</span>
                    <span>{branch.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Email</span>
                    <span className="text-xs">{branch.email}</span>
                  </div>
                </div>

                <div className="card-actions mt-6">
                  <button
                    onClick={() => openEditModal(branch)}
                    className="btn btn-outline btn-sm w-full flex items-center justify-center gap-2"
                  >
                    <Edit3 size={16} /> Edit Branch
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Branch Modal */}
      {showAddModal && (
        <div className="modal modal-open backdrop-blur-xs">
          <div className="modal-box max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-xl">Add New Branch</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="btn btn-ghost btn-circle"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleAddBranch} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Branch Name"
                  className="input input-bordered w-full"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Branch Code"
                  className="input input-bordered w-full"
                  required
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                />
              </div>

              <input
                type="text"
                placeholder="City"
                className="input input-bordered w-full"
                required
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
              />

              <input
                type="tel"
                placeholder="Phone Number"
                className="input input-bordered w-full"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />

              <input
                type="email"
                placeholder="Email Address"
                className="input input-bordered w-full"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />

              <textarea
                placeholder="Full Address"
                className="textarea textarea-bordered w-full"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Latitude"
                  className="input input-bordered"
                  value={formData.latitude}
                  onChange={(e) =>
                    setFormData({ ...formData, latitude: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Longitude"
                  className="input input-bordered"
                  value={formData.longitude}
                  onChange={(e) =>
                    setFormData({ ...formData, longitude: e.target.value })
                  }
                />
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Branch Modal */}
      {showEditModal && editingBranch && (
        <div className="modal modal-open backdrop-blur-xs">
          <div className="modal-box max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-xl">Edit Branch</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="btn btn-ghost btn-circle"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleUpdateBranch} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  className="input input-bordered w-full"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                <input
                  type="text"
                  className="input input-bordered w-full"
                  required
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                />
              </div>

              <input
                type="text"
                className="input input-bordered w-full"
                required
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
              />

              <input
                type="tel"
                className="input input-bordered w-full"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />

              <input
                type="email"
                className="input input-bordered w-full"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />

              <textarea
                className="textarea textarea-bordered w-full"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />

              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

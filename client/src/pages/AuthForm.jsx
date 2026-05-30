import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ShieldCheck } from "lucide-react";

import { api } from "../services/api";
import { useAuth } from "../contexts/authContext";

const AuthForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLogin(true);

    try {
      const response = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      toast.success(response.data.message);
      login(response.data.user);

      const roleRoutes = {
        Admin: "/admin",
        Driver: "/driver",
        Sales: "/sales",
        Dispatch1_Picking: "/dispatch/picking",
        Dispatch2_Packaging: "/dispatch/packaging",
        Dispatch2_Manager: "/dispatch/manager",
        Logistics: "/logistics",
        Driver: "/driver",
        Sales: "/sales",
      };

      const userRole = response?.data?.user?.role;

      navigate(roleRoutes[userRole] || "/");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to login. Please try again.",
      );
    } finally {
      setIsLogin(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <div className="card w-full mx-auto max-w-md bg-base-100 shadow-2xl border border-base-300">
        <div className="card-body mx-auto w-full max-w-sm">
          {/* Logo */}
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="text-primary" size={34} />
            </div>
          </div>

          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary">Nile Computers</h1>

            <p className="text-base-content/70 mt-2">
              Operations Management System
            </p>

            <p className="text-xs text-base-content/50 mt-1">
              Sales • Dispatch • Logistics • Inventory
            </p>
          </div>

          {/* Email */}
          <div className="form-control mt-6">
            <label className="label mb-2">
              <span className="label-text">Email Address</span>
            </label>

            <label className="input input-bordered rounded-lg flex items-center gap-2">
              <Mail size={18} className="opacity-60" />

              <input
                type="email"
                name="email"
                className="grow"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="username"
              />
            </label>
          </div>

          {/* Password */}
          <div className="form-control mt-4">
            <label className="label mb-2">
              <span className="label-text">Password</span>
            </label>

            <label className="input input-bordered rounded-lg flex items-center gap-2">
              <Lock size={18} className="opacity-60" />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="grow"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
              />

              <button
                type="button"
                onClick={togglePassword}
                className="btn btn-ghost btn-xs"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </label>
          </div>

          {/* Forgot Password */}
          {/* <div className="flex justify-end mt-2">
            <button
              type="button"
              className="link link-primary text-sm"
            >
              Forgot Password?
            </button>
          </div> */}

          {/* Login Button */}
          <div className="form-control mt-6 w-full">
            <button
              type="submit"
              onClick={handleLogin}
              disabled={!formData.email || !formData.password || isLogin}
              className="btn btn-primary rounded-lg w-full"
            >
              {isLogin ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="divider my-6"></div>

          <div className="text-center">
            <p className="text-xs text-base-content/70">
              Nile Computers Operations Platform
            </p>

            <p className="text-xs text-base-content/50 mt-1">Version 1.0.0</p>

            <p className="text-[11px] text-base-content/40 mt-3">
              © {new Date().getFullYear()} Nile Computers. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;

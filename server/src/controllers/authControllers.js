import { db } from "../config/dbConnection.js";
import bcrypt from "bcryptjs";
import {
  generateTokens,
  storeRefreshToken,
  revokeRefreshToken,
  verifyRefreshToken,
} from "../services/auth.js";
import { formatKenyanNumber } from "../utils/formatNumber.js";

const setAuthCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    maxAge: 12 * 60 * 60 * 1000,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });
};

const register = async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    phone,
    password,
    branch_id,
    role_id,
    employee_number,
  } = req.body;

  const formattedNumber = formatKenyanNumber(phone, "+254");

  try {
    const passHash = await bcrypt.hash(password, 10);

    // Check if user already exists
    const existing = await db.query(
      `SELECT id FROM users WHERE email = ? OR employee_number = ?`,
      [email, employee_number],
    );

    if (existing.length > 0) {
      return res
        .status(400)
        .json({
          message: "User with this email or employee number already exists",
        });
    }

    const result = await db.query(
      `INSERT INTO users 
       (first_name, last_name, email, phone, password_hash, branch_id, role_id, employee_number, active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        first_name,
        last_name,
        email,
        formattedNumber,
        passHash,
        branch_id,
        role_id,
        employee_number,
      ],
    );

    const userId = result.insertId;

    // Fetch full user with role name
    const userRows = await db.query(
      `
      SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.branch_id, 
             r.name as role_name, u.active, u.employee_number, u.photo_url, u.assigned_vehicle_id
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `,
      [userId],
    );

    const user = userRows[0];

    const { accessToken, refreshToken } = generateTokens(
      user.id,
      user.role_name,
      user.email,
      user.branch_id,
      `${user.first_name} ${user.last_name}`,
      user.assigned_vehicle_id,
      user.photo_url,
      user.employee_number,
    );

    await storeRefreshToken(user.id, refreshToken);
    setAuthCookies(res, accessToken, refreshToken);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role_name,
        branch_id: user.branch_id,
      },
    });
  } catch (error) {
    console.error("Registration error:", error.message);
    res
      .status(500)
      .json({ message: "Internal server error", details: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const users = await db.query(
      `
      SELECT u.*, r.name as role_name 
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.email = ? AND u.active = TRUE
    `,
      [email.trim()],
    );

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = users[0];

    const passwordMatch = await bcrypt.compare(
      password.trim(),
      user.password_hash,
    );
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = generateTokens(
      user.id,
      user.role_name,
      user.email,
      user.branch_id,
      `${user.first_name} ${user.last_name}`,
      user.assigned_vehicle_id,
      user.photo_url,
      user.employee_number,
    );

    // Revoke old refresh token and store new one
    await revokeRefreshToken(user.id);
    await storeRefreshToken(user.id, refreshToken);

    setAuthCookies(res, accessToken, refreshToken);

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role_name,
        branch_id: user.branch_id,
        employee_number: user.employee_number,
        photo_url: user.photo_url,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await revokeRefreshToken(req.user?.id);
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const refreshTokens = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);

    const users = await db.query(
      `
      SELECT u.id, u.email, r.name as role_name 
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ? AND u.active = TRUE
    `,
      [decoded.id],
    );

    if (users.length === 0) {
      return res.status(401).json({ message: "User not found or inactive" });
    }

    const user = users[0];

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      generateTokens(
        user.id,
        user.role_name,
        user.email,
        user.branch_id,
        `${user.first_name} ${user.last_name}`,
      );

    await revokeRefreshToken(user.id);
    await storeRefreshToken(user.id, newRefreshToken);

    setAuthCookies(res, newAccessToken, newRefreshToken);

    res.status(200).json({
      message: "Tokens refreshed successfully",
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("Token refresh error:", error.message);

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};

const updatePassword = async (req, res) => {
  const { email, old_password, new_password } = req.body;

  try {
    const users = await db.query(
      `SELECT password_hash FROM users WHERE email = ?`,
      [email],
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(old_password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    const newHash = await bcrypt.hash(new_password, 10);

    await db.query(`UPDATE users SET password_hash = ? WHERE email = ?`, [
      newHash,
      email,
    ]);

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password update error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { register, login, logout, refreshTokens, updatePassword };
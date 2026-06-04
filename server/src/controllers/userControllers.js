import bcrypt from "bcryptjs";
import { db } from "../config/dbConnection.js";
import { formatKenyanNumber } from "../utils/formatNumber.js";
import { addNotification, addActivityLog, getClientIp } from "../utils/helpers.js";

const createUser = async (req, res) => {
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
  const defaultPassword = password || "12345678";

  let user = null;

  try {
    const passHash = await bcrypt.hash(defaultPassword, 10);

    // Check duplicate
    const existing = await db.query(
      `SELECT id FROM users WHERE email = ? OR employee_number = ?`,
      [email, employee_number]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    await db.transaction(async (conn) => {
      const [result] = await conn.query(
        `INSERT INTO users 
         (first_name, last_name, email, phone, password_hash, branch_id, role_id, employee_number, active) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
        [first_name, last_name, email, formattedNumber, passHash, branch_id, role_id, employee_number]
      );

      const userId = result.insertId;

      const [userRows] = await conn.query(
        `
        SELECT u.id, u.first_name, u.last_name, u.email, u.employee_number,
               r.name as role_name, u.branch_id
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = ?`,
        [userId]
      );

      user = userRows[0];

      await addActivityLog({
        user_id: req.user?.id || 1,
        action: "CREATE_USER",
        entity_type: "user",
        entity_id: userId,
        description: `Created new user: ${user.first_name} ${user.last_name} as ${user.role_name}`,
        ip_address: getClientIp(req)
      }, conn);

      await addNotification({
        user_id: req.user?.id || 1,
        receiver: "admin",
        title: "New Employee Added",
        message: `${user.first_name} ${user.last_name} has been added as ${user.role_name}`,
        type: "system",
        entity_type: "user",
        entity_id: userId,
      }, conn);

      await addNotification({
        user_id: userId,
        receiver: "user",
        title: "Welcome to Nile Computers",
        message: `Hello ${user.first_name}, your account has been created. Staff ID: ${user.employee_number}. Default password: 12345678`,
        type: "system",
        entity_type: "user",
        entity_id: userId,
      }, conn);
    });

    res.status(201).json({
      message: "User registered successfully",
      defaultPassword: !password ? "12345678" : null,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role_name,
        branch_id: user.branch_id,
        employee_number: user.employee_number,
      },
    });

  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { search, role, branch, active } = req.query;

    let sql = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        CONCAT(u.first_name, ' ', u.last_name) AS full_name,
        u.email,
        u.phone,
        u.employee_number,
        u.active,
        u.last_login,
        u.created_at,
        r.name AS role,
        b.name AS branch,
        b.code AS branch_code
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN branches b ON u.branch_id = b.id
      WHERE 1 = 1
    `;

    const params = [];

    if (search) {
      sql += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR u.employee_number LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (role) {
      sql += ` AND r.name = ?`;
      params.push(role);
    }
    if (branch) {
      sql += ` AND b.name = ?`;
      params.push(branch);
    }
    if (active !== undefined) {
      sql += ` AND u.active = ?`;
      params.push(active === "true" ? 1 : 0);
    }

    sql += ` ORDER BY u.created_at DESC`;

    const users = await db.query(sql, params);
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getUserById = async (req, res) => {
  try {
    const [user] = await db.query(
      `
      SELECT u.*, r.name AS role_name, b.name AS branch_name 
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN branches b ON u.branch_id = b.id
      WHERE u.id = ?`,
      [req.params.id],
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const toggleUserStatus = async (req, res) => {
  const userId = req.params.id;

  try {
    const [user] = await db.query(`
      SELECT id, first_name, last_name, email, employee_number, active 
      FROM users WHERE id = ?`, [userId]);

    if (!user) return res.status(404).json({ message: "User not found" });

    const newStatus = !user.active;

    await db.transaction(async (conn) => {
      // Update user status
      await conn.query(`UPDATE users SET active = ? WHERE id = ?`, [newStatus, userId]);

      // Log Activity
      await addActivityLog({
        user_id: req.user?.id || 1,
        action: newStatus ? "ACTIVATE_USER" : "DEACTIVATE_USER",
        entity_type: "user",
        entity_id: userId,
        description: `${newStatus ? "Activated" : "Deactivated"} user: ${user.first_name} ${user.last_name}`,
        ip_address: getClientIp(req)
      }, conn);

      // Notify Admin
      await addNotification({
        user_id: req.user?.id || 1,
        title: newStatus ? "User Activated" : "User Deactivated",
        message: `${user.first_name} ${user.last_name} has been ${newStatus ? "activated" : "deactivated"}`,
        type: "system",
        entity_type: "user",
        entity_id: userId,
      }, conn);

      // Notify the user (if active)
      if (newStatus) {
        await addNotification({
          user_id: userId,
          receiver: "user",
          title: "Account Status Updated",
          message: `Hello ${user.first_name}, your account has been activated. You can now log in.`,
          type: "system",
          entity_type: "user",
          entity_id: userId,
        }, conn);
      }
    });

    res.json({
      message: `User ${newStatus ? "activated" : "deactivated"} successfully`,
      active: newStatus,
    });

  } catch (error) {
    console.error("Toggle status error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateUser = async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    phone,
    employee_number,
    role_id,
    branch_id,
    active,
  } = req.body;
  const userId = req.params.id;

  try {
    let oldUser;

    await db.transaction(async (conn) => {
      [oldUser] = await conn.query(
        `SELECT first_name, last_name, role_id, branch_id FROM users WHERE id = ?`, 
        [userId]
      );

      if (!oldUser) throw new Error("User not found");

      // Update user
      const result = await conn.query(
        `UPDATE users SET 
          first_name = ?, last_name = ?, email = ?, phone = ?, 
          employee_number = ?, role_id = ?, branch_id = ?, active = ?
         WHERE id = ?`,
        [first_name, last_name, email, phone, employee_number, role_id, branch_id, active, userId]
      );

      if (result.affectedRows === 0) throw new Error("User not found");

      // Log the update
      await addActivityLog({
        user_id: req.user?.id || 1,
        action: "UPDATE_USER",
        entity_type: "user",
        entity_id: userId,
        description: `Updated user: ${first_name} ${last_name}`,
        ip_address: getClientIp(req)
      }, conn);

      // Notify admin
      await addNotification({
        user_id: req.user?.id || 1,
        receiver: "admin",
        title: "User Profile Updated",
        message: `Profile of ${first_name} ${last_name} has been updated`,
        type: "system",
        entity_type: "user",
        entity_id: userId,
      }, conn);
    });

    res.status(200).json({ message: "User updated successfully" });

  } catch (error) {
    console.error("Update user error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    let userName = "";

    await db.transaction(async (conn) => {
      const [user] = await conn.query(
        `SELECT first_name, last_name FROM users WHERE id = ?`, 
        [userId]
      );

      if (!user) throw new Error("User not found");

      userName = `${user.first_name} ${user.last_name}`;

      await conn.query(`UPDATE users SET active = 0 WHERE id = ?`, [userId]);

      await addActivityLog({
        user_id: req.user?.id || 1,
        action: "DELETE_USER",
        entity_type: "user",
        entity_id: userId,
        description: `Deleted user: ${userName}`,
        ip_address: getClientIp(req)
      }, conn);

      await addNotification({
        user_id: req.user?.id || 1,
        title: "User Deleted",
        message: `${userName} has been deleted from the system`,
        type: "user",
        entity_type: "system",
        entity_id: userId,
      }, conn);
    });

    res.json({ message: "User deleted successfully" });

  } catch (error) {
    console.error("Delete user error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus,
};

import { db } from "../config/dbConnection.js";
import {
  addNotification,
  addActivityLog,
  getClientIp,
} from "../utils/helpers.js";

const getRoles = async (req, res) => {
  try {
    const roles = await db.query(
      `SELECT id, name, description FROM roles ORDER BY name`,
    );
    res.json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createRole = async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Role name is required" });
  }

  try {
    const existing = await db.query(`SELECT id FROM roles WHERE name = ?`, [
      name.trim(),
    ]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Role name already exists" });
    }

    let roleId;

    await db.transaction(async (conn) => {
      const [result] = await conn.query(
        `INSERT INTO roles (name, description) VALUES (?, ?)`,
        [name.trim(), description || null],
      );

      roleId = result.insertId;

      // Log Activity
      await addActivityLog(
        {
          user_id: req.user?.id || 1,
          action: "CREATE_ROLE",
          entity_type: "role",
          entity_id: roleId,
          description: `Created new role: ${name.trim()}`,
          ip_address: getClientIp(req),
        },
        conn,
      );

      // Notify Admin
      await addNotification(
        {
          user_id: req.user?.id || 1,
          receiver: "admin",
          title: "New Role Created",
          message: `Role "${name.trim()}" has been created successfully.`,
          type: "system",
          entity_type: "role",
          entity_id: roleId,
        },
        conn,
      );
    });

    res.status(201).json({
      message: "Role created successfully",
      roleId: roleId,
    });
  } catch (error) {
    console.error("Error creating role:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateRole = async (req, res) => {
  const { name, description } = req.body;
  const { id } = req.params;

  if (!name) {
    return res.status(400).json({ message: "Role name is required" });
  }

  try {
    await db.transaction(async (conn) => {
      // Check duplicate name
      const existing = await conn.query(
        `SELECT id FROM roles WHERE name = ? AND id != ?`,
        [name.trim(), id],
      );

      if (existing.length > 0) {
        throw new Error("Role name already exists");
      }

      const result = await conn.query(
        `UPDATE roles SET name = ?, description = ? WHERE id = ?`,
        [name.trim(), description || null, id],
      );

      if (result.affectedRows === 0) {
        throw new Error("Role not found");
      }

      // Log Activity
      await addActivityLog(
        {
          user_id: req.user?.id || 1,
          action: "UPDATE_ROLE",
          entity_type: "role",
          entity_id: id,
          description: `Updated role: ${name.trim()}`,
          ip_address: getClientIp(req),
        },
        conn,
      );

      // Notify Admin
      await addNotification(
        {
          user_id: req.user?.id || 1,
          receiver: "admin",
          title: "Role Updated",
          message: `Role "${name.trim()}" has been updated.`,
          type: "system",
          entity_type: "role",
          entity_id: id,
        },
        conn,
      );
    });

    res.status(200).json({ message: "Role updated successfully" });
  } catch (error) {
    console.error("Error updating role:", error.message);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

const deleteRole = async (req, res) => {
  const { id } = req.params;

  try {
    let roleName = "";

    await db.transaction(async (conn) => {
      const [role] = await conn.query(`SELECT name FROM roles WHERE id = ?`, [
        id,
      ]);

      if (!role) throw new Error("Role not found");

      roleName = role.name;

      const result = await conn.query(`DELETE FROM roles WHERE id = ?`, [id]);

      if (result.affectedRows === 0) {
        throw new Error("Role not found");
      }

      // Log Activity
      await addActivityLog(
        {
          user_id: req.user?.id || 1,
          action: "DELETE_ROLE",
          entity_type: "role",
          entity_id: id,
          description: `Deleted role: ${roleName}`,
          ip_address: getClientIp(req),
        },
        conn,
      );

      // Notify Admin
      await addNotification(
        {
          user_id: req.user?.id || 1,
          receiver: "admin",
          title: "Role Deleted",
          message: `Role "${roleName}" has been deleted from the system.`,
          type: "system",
          entity_type: "role",
          entity_id: id,
        },
        conn,
      );
    });

    res.status(200).json({ message: "Role deleted successfully" });
  } catch (error) {
    console.error("Error deleting role:", error.message);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

export { getRoles, createRole, updateRole, deleteRole };

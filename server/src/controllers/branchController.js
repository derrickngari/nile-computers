import { db } from "../config/dbConnection.js";
import {
  addNotification,
  addActivityLog,
  getClientIp,
} from "../utils/helpers.js";

const createBranch = async (req, res) => {
  const { name, code, phone, email, address, city, latitude, longitude } =
    req.body;

  if (!name || !code) {
    return res.status(400).json({ message: "Name and code are required" });
  }

  try {
    const existing = await db.query(`SELECT id FROM branches WHERE code = ?`, [
      code,
    ]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Branch code already exists" });
    }

    let branchId;

    await db.transaction(async (conn) => {
      const [result] = await conn.query(
        `INSERT INTO branches (name, code, phone, email, address, city, latitude, longitude, active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
        [name, code, phone, email, address, city, latitude, longitude],
      );

      branchId = result.insertId;

      // Log Activity
      await addActivityLog(
        {
          user_id: req.user?.id || 1,
          action: "CREATE_BRANCH",
          entity_type: "branch",
          entity_id: branchId,
          description: `Created new branch: ${name} (${code})`,
          ip_address: getClientIp(req),
        },
        conn,
      );

      // Notify Admin
      await addNotification(
        {
          user_id: req.user?.id || 1,
          receiver: "admin",
          title: "New Branch Created",
          message: `Branch "${name}" (${code}) has been successfully created.`,
          type: "system",
          entity_type: "branch",
          entity_id: branchId,
        },
        conn,
      );
    });

    res.status(201).json({
      message: "Branch created successfully",
      branchId: branchId,
    });
  } catch (error) {
    console.error("Error creating branch:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateBranch = async (req, res) => {
  const { id } = req.params;
  const { name, code, phone, email, address, city, latitude, longitude } =
    req.body;

  if (!name || !code) {
    return res.status(400).json({ message: "Name and code are required" });
  }

  try {
    await db.transaction(async (conn) => {
      const existing = await conn.query(
        `SELECT id FROM branches WHERE code = ? AND id != ?`,
        [code, id],
      );

      if (existing.length > 0) {
        throw new Error("Branch code already exists");
      }

      const result = await conn.query(
        `UPDATE branches 
         SET name = ?, code = ?, phone = ?, email = ?, address = ?, city = ?, latitude = ?, longitude = ? 
         WHERE id = ?`,
        [name, code, phone, email, address, city, latitude, longitude, id],
      );

      if (result.affectedRows === 0) {
        throw new Error("Branch not found");
      }

      // Log Activity
      await addActivityLog(
        {
          user_id: req.user?.id || 1,
          action: "UPDATE_BRANCH",
          entity_type: "branch",
          entity_id: id,
          description: `Updated branch: ${name} (${code})`,
          ip_address: getClientIp(req),
        },
        conn,
      );

      // Notify Admin
      await addNotification(
        {
          user_id: req.user?.id || 1,
          receiver: "admin",
          title: "Branch Updated",
          message: `Branch "${name}" has been updated.`,
          type: "system",
          entity_type: "branch",
          entity_id: id,
        },
        conn,
      );
    });

    res.status(200).json({ message: "Branch updated successfully" });
  } catch (error) {
    console.error("Error updating branch:", error.message);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

const toggleBranchStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const [branch] = await db.query(
      `SELECT id, name, code, active FROM branches WHERE id = ?`,
      [id],
    );

    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    const newStatus = !branch.active;

    await db.transaction(async (conn) => {
      await conn.query(`UPDATE branches SET active = ? WHERE id = ?`, [
        newStatus,
        id,
      ]);

      await addActivityLog(
        {
          user_id: req.user?.id || 1,
          action: newStatus ? "ACTIVATE_BRANCH" : "DEACTIVATE_BRANCH",
          entity_type: "branch",
          entity_id: id,
          description: `${newStatus ? "Activated" : "Deactivated"} branch: ${branch.name} (${branch.code})`,
          ip_address: getClientIp(req),
        },
        conn,
      );

      await addNotification(
        {
          user_id: req.user?.id || 1,
          receiver: "admin",
          title: `Branch ${newStatus ? "Activated" : "Deactivated"}`,
          message: `Branch "${branch.name}" has been ${newStatus ? "activated" : "deactivated"}.`,
          type: "system",
          entity_type: "branch",
          entity_id: id,
        },
        conn,
      );
    });

    res.status(200).json({
      message: `Branch ${newStatus ? "activated" : "deactivated"} successfully`,
      active: newStatus,
    });
  } catch (error) {
    console.error("Error toggling branch status:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getBranches = async (req, res) => {
  try {
    const branches = await db.query(`SELECT * FROM branches`);
    res.status(200).json(branches);
  } catch (error) {
    console.error("Error fetching branches:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getBranchById = async (req, res) => {
  const { id } = req.params;

  try {
    const branches = await db.query(`SELECT * FROM branches WHERE id = ?`, [
      id,
    ]);
    if (branches.length === 0) {
      return res.status(404).json({ message: "Branch not found" });
    }
    res.status(200).json(branches[0]);
  } catch (error) {
    console.error("Error fetching branch:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export {
  createBranch,
  getBranches,
  getBranchById,
  updateBranch,
  toggleBranchStatus,
};

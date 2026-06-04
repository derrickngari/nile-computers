import { db } from "../config/dbConnection.js";
import { addActivityLog } from "../utils/helpers.js";

const getNotifications = async (req, res) => {
  const { page = 1, limit = 20, read } = req.query;
  const offset = (page - 1) * limit;

  try {
    let sql = `
      SELECT id, title, message, type, receiver, is_read, created_at, entity_type, entity_id, link
      FROM notifications 
      WHERE user_id = ?
    `;
    const params = [req.user.id];

    if (read !== undefined) {
      sql += ` AND is_read = ?`;
      params.push(read === 'true' ? 1 : 0);
    }

    sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const notifications = await db.query(sql, params);

    // Get unread count
    const [unreadCount] = await db.query(
      `SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0`,
      [req.user.id]
    );

    res.json({
      notifications,
      unreadCount: unreadCount.count,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: notifications.length
      }
    });
  } catch (error) {
    console.error("Error fetching notifications:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getUnreadNotifications = async (req, res) => {
  try {
    const notifications = await db.query(`
      SELECT id, title, message, type, created_at, entity_type, entity_id, link
      FROM notifications 
      WHERE user_id = ? AND is_read = 0 
      ORDER BY created_at DESC 
      LIMIT 10
    `, [req.user.id]);

    res.json({ notifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const markAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`,
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Notification not found or not yours" });
    }

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await db.query(
      `UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0`,
      [req.user.id]
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteNotification = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `UPDATE notifications SET deleted_at = NOW() WHERE id = ? AND user_id = ?`,
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export {
  getNotifications,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
import { db } from "../config/dbConnection.js";

const addNotification = async (data, conn = null) => {
  const { user_id, receiver = "admin", title, message, type = 'system', entity_type = null, entity_id = null, link = null } = data;
  
  const query = `
    INSERT INTO notifications 
    (user_id, receiver, title, message, type, entity_type, entity_id, link, is_read) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, FALSE)
  `;

  const params = [user_id, receiver, title, message, type, entity_type, entity_id, link];

  try {
    if (conn) {
      return await conn.query(query, params);
    } else {
      return await db.query(query, params);
    }
  } catch (error) {
    console.error("Failed to add notification:", error.message);
    throw error;
  }
};

const addActivityLog = async (data, conn = null) => {
  const { user_id, order_id = null, action, entity_type = null, entity_id = null, description, ip_address = null } = data;

  const query = `
    INSERT INTO activity_logs 
    (user_id, order_id, action, entity_type, entity_id, description, ip_address) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [user_id, order_id, action, entity_type, entity_id, description, ip_address];

  try {
    if (conn) {
      return await conn.query(query, params);
    } else {
      return await db.query(query, params);
    }
  } catch (error) {
    console.error("Failed to add activity log:", error.message);
    throw error;
  }
};

const getClientIp = (req) => {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    req.ip
  );
};

export { addActivityLog, addNotification, getClientIp }
import { logger } from "../services/logger.js";
import jwt from "jsonwebtoken";
import { db } from "../config/dbConnection.js";

const generateTokens = (
  id,
  role,
  email,
  branchId,
  name,
  assignedVehicle = null,
  profileUrl = null,
  staffId = null,
) => {
  const accessToken = jwt.sign(
    { id, role, email, name, branchId, assignedVehicle, profileUrl, staffId },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    },
  );
  const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
};

const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    logger.warn(`Token verification failed: ${error.message}`);
    return null;
  }
};

const storeRefreshToken = async (userId, token) => {
  await db.query(
    "INSERT INTO auth_tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))",
    [userId, token],
  );
};

const revokeRefreshToken = async (userId) => {
  await db.query("DELETE FROM auth_tokens WHERE user_id = ?", [userId]);
};

const verifyRefreshToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const tokenRecord = await db.query(
      "SELECT * FROM auth_tokens WHERE token = ?",
      [token],
    );

    if (tokenRecord.length === 0) {
      throw new Error("Invalid or expired token");
    }

    return decoded;
  } catch (error) {
    logger.error("refresh tokem verification failed: ", error.message);
    throw error;
  }
};

export {
  generateTokens,
  verifyToken,
  storeRefreshToken,
  revokeRefreshToken,
  verifyRefreshToken,
};

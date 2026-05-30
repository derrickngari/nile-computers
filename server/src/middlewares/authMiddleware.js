import jwt from "jsonwebtoken";
import crypto from "crypto";
import { db } from "../config/dbConnection.js";
import { logger } from "../services/logger.js";

// check if user is autheniticated
const authMiddleware = async (req, res, next) => {
  const token =
    req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
  if (!token)
    return res.status(401).json({ message: "Authentication required" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    logger.error("Authorization failed: ", err.message);
    res.status(403).json({ message: "Invalid or epired token" });
  }
};

// check if user is admin
const isAdmin = async (req, res, next) => {
  if (req.user.role != "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

// check if user is driver
const isDriver = async (req, res, next) => {
  if (req.user.role != "driver") {
    return res.status(403).json({ message: "Driver access required" });
  }
  next();
};

// check for refresh token
const checkRefreshToken = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken)
    return res.status(401).json({ message: "Authentication required" });

  const tokenRecored = await db.query(
    "SELECT * FROM auth_tokens WHERE refresh_token = ? AND expires_at > NOW()",
    [refreshToken],
  );
  if (tokenRecored.length === 0)
    return res.status(401).json({ message: "Invalid or epired token" });

  req.refreshToken = refreshToken;
  next();
};

const verifySignature = (req, res, next) => {
  const signature = req.headers["x-signature"];
  if (!signature) return res.status(401).json({ error: "Missing signature" });

  const payload = req.body;
  const expected = crypto
    .createHmac("sha256", process.env.INTER_SYSTEM_SECRET)
    .update(JSON.stringify(payload))
    .digest("hex");

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  if (Math.abs(Date.now() - payload.timestamp) > 300000) {
    return res.status(401).json({ error: "Request too old" });
  }

  next();
};

export {
  authMiddleware,
  isAdmin,
  checkRefreshToken,
  isDriver,
  verifySignature,
};

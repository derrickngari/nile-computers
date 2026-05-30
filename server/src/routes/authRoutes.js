import { Router } from "express";
import {
  register,
  login,
  logout,
  refreshTokens,
  updatePassword,
} from "../controllers/authControllers.js";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);
router.get("/me", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});
router.post("/refresh", refreshTokens);
router.put("/update-password", authMiddleware, isAdmin, updatePassword);

export default router;

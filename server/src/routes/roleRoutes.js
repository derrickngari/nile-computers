import { Router } from "express";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole
} from "../controllers/roleControllers.js";

const router = Router();

router.get("/", authMiddleware, isAdmin, getRoles);
router.post("/", authMiddleware, isAdmin, createRole);
router.put("/:id", authMiddleware, isAdmin, updateRole);
router.delete("/:id", authMiddleware, isAdmin, deleteRole);

export default router;
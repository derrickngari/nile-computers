import { Router } from "express";
import {
  createBranch,
  getBranches,
  getBranchById,
  updateBranch,
  toggleBranchStatus,
} from "../controllers/branchController.js";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", authMiddleware, isAdmin, createBranch);
router.get("/", authMiddleware, getBranches);
router.get("/:id", authMiddleware, getBranchById);
router.put("/:id", authMiddleware, isAdmin, updateBranch);
router.patch("/:id/status", authMiddleware, isAdmin, toggleBranchStatus);
    
export default router;

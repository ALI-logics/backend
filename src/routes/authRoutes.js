import { Router } from "express";
import {
  adminRegister,
  login,
  protectedRoute,
  register,
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/index.js";

const router = Router();

router.post("/register", register);

router.post("/admin-register", adminRegister);

router.get("/logged", authMiddleware, protectedRoute);

router.post("/login", login);

export default router;

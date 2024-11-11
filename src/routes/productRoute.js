import { Router } from "express";
import {
  deleteProduct,
  getProducts,
  updateProduct,
  uploadProducts,
} from "../controllers/productController.js";
import {
  adminMiddleware,
  authMiddleware,
  upload,
} from "../middleware/index.js";

const router = Router();
router.post(
  "/upload",
  authMiddleware,
  adminMiddleware,
  upload.array("images"),
  uploadProducts
);

router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  upload.array("images"),
  updateProduct
);

router.get("/", getProducts);

export default router;

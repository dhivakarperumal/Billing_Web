import express from "express";
import { 
    getProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct,
    getNextProductId
} from "../controllers/productController.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/next-id", getNextProductId);
router.get("/:id", getProductById);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;

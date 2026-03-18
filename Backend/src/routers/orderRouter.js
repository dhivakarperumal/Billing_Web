import express from "express";
import { 
    getOrders, 
    getOrderById, 
    updateOrderStatus, 
    createOrder 
} from "../controllers/orderController.js";

const router = express.Router();

router.get("/", getOrders);
router.get("/:id", getOrderById);
router.post("/", createOrder);
router.put("/:id/status", updateOrderStatus);

export default router;

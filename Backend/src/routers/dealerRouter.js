import express from "express";
import { getDealers, createDealer, updateDealer, deleteDealer } from "../controllers/dealerController.js";

const router = express.Router();

router.get("/", getDealers);
router.post("/", createDealer);
router.put("/:id", updateDealer);
router.delete("/:id", deleteDealer);

export default router;

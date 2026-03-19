import express from "express";
import { getReportSummary } from "../controllers/reportController.js";

const router = express.Router();

router.get("/summary", getReportSummary);

export default router;

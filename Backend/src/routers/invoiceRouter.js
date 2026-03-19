import express from "express";
import { createInvoice, getDealerInvoices, getAllInvoices, getInvoiceDetails } from "../controllers/invoiceController.js";

const router = express.Router();

router.get("/", getAllInvoices);
router.get("/:id", getInvoiceDetails);
router.get("/dealer/:dealerId", getDealerInvoices);
router.post("/", createInvoice);

export default router;

import "./src/config/env.js";
import express from "express";
import cors from "cors";

import authRouter from "./src/routers/authRouter.js";
import categoryRouter from "./src/routers/categoryRouter.js";
import productRouter from "./src/routers/productRouter.js";
import dashboardRouter from "./src/routers/dashboardRouter.js";
import orderRouter from "./src/routers/orderRouter.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());

// Limit Logger
app.use((req, res, next) => {
    if (req.headers['content-length']) {
        const sizeInMb = (parseInt(req.headers['content-length']) / (1024 * 1024)).toFixed(2);
        console.log(`[DEBUG] Incoming Request: ${req.method} ${req.url} - Size: ${sizeInMb}MB`);
    }
    next();
});

app.use(express.json({ limit: 524288000 })); // 500MB in bytes
app.use(express.urlencoded({ limit: 524288000, extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.use("/api/auth", authRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/products", productRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/orders", orderRouter);


// Test Route
app.get("/", (req, res) => {
  res.send("Backend Running");
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
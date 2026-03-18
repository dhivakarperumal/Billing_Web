import "./src/config/env.js";
import express from "express";
import cors from "cors";

import authRouter from "./src/routers/authRouter.js";
import categoryRouter from "./src/routers/categoryRouter.js";
import productRouter from "./src/routers/productRouter.js";
import orderRouter from "./src/routers/orderRouter.js";

const app = express();

app.use(cors());
app.use(express.json());

// Auth Routes
app.use("/api/auth", authRouter);
// Feature Routes
app.use("/api/categories", categoryRouter);
app.use("/api/products", productRouter);
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
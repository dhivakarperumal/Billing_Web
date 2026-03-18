import "./src/config/env.js";
import express from "express";
import cors from "cors";

import authRouter from "./src/routers/authRouter.js";

const app = express();

app.use(cors());
app.use(express.json());

// Auth Routes
app.use("/api/auth", authRouter);

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
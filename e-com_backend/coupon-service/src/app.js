const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
require("dotenv").config();

const couponRoutes = require("./routes/couponRoutes");

// Import your existing middleware
const notFoundMiddleware = require("./middleware/notFoundMiddleware");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

// Security
app.use(helmet());

// Enable CORS
app.use(cors());

// Compression
app.use(compression());

// Logging
app.use(morgan("dev"));

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  if (
    req.body &&
    req.body.type === "Buffer" &&
    Array.isArray(req.body.data)
  ) {
    try {
      req.body = JSON.parse(
        Buffer.from(req.body.data).toString("utf8")
      );
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid JSON body",
      });
    }
  }

  next();
});

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: process.env.SERVICE_NAME,
    status: "UP",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/v1/coupons", couponRoutes);

// 404 Handler
app.use(notFoundMiddleware);

// Global Error Handler
app.use(errorMiddleware);

module.exports = app;
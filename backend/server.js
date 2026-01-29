require("dotenv").config();
const express = require("express");
const cors = require("cors");

const sequelize = require("./config/db");

// Routes
const contactRoutes = require("./routes/contact_routes");
const newsletterRoutes = require("./routes/newsletter_routes");
const authRoutes = require("./routes/auth_routes");
const adminRoutes = require("./routes/admin_routes");

// Models
require("./models/contact_model");
require("./models/newsletter_model");
require("./models/user_model");
require("./models/token_model");
require("./models/organization_model");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://192.168.1.51:3000",
    ],
    credentials: true,
  })
);
app.use(express.json());

// Public routes
app.use("/api/contacts", contactRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/auth", authRoutes);

// Protected admin routes
app.use("/api/admin", adminRoutes);

(async () => {
  try {
    await sequelize.sync();
    console.log("Database connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error("Database connection failed:", err);
  }
})();

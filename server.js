import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Routes
import presetRoutes from "./routes/presets.js";
import categoryRoutes from "./routes/categories.js";
import purchaseRoutes from "./routes/purchases.js";
import paymentRoutes from "./routes/payment.js";
import adminRoutes from "./routes/admin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "10mb" }));

// API Routes
app.use("/api/presets", presetRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/payment-info", paymentRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/api", (req, res) => {
  res.send("Alight Motion Preset API is running!");
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

// server.js - Edu-Smart Backend Entry Point (FIXED)

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

// Routes
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const aiRoutes = require("./routes/aiRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const { setSocketIO } = require("./socket");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS CONFIG
const isAllowedOrigin = (origin) => {
  if (!origin) return true; // Postman / server-to-server
  if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL) return true;
  // Allow any Render.com deployment
  if (/^https:\/\/[\w-]+\.onrender\.com$/.test(origin)) return true;
  // Allow localhost for dev
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) callback(null, true);
      else callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Debug log (optional)
if (process.env.NODE_ENV !== "production") {
  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// ✅ Root route
app.get("/", (_req, res) => {
  res.json({ message: "Edu-Smart API Running ✅" });
});

// ✅ API routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/announcements", announcementRoutes);

// ❌ 404 handler
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ❌ Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: err.message });
});

// ✅ Create HTTP server
const server = http.createServer(app);

// ✅ Socket setup
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

setSocketIO(io);

// ✅ MongoDB connection + server start
const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI missing in .env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected");

    server.listen(PORT, () => {
      console.log(`🚀 Server running: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ DB Error:", err.message);
    process.exit(1);
  }
};

startServer();

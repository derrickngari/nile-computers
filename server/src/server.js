// Core imports
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet"
import dotenv from "dotenv";
dotenv.config();
import { rateLimit } from "express-rate-limit";
import session from "express-session";
import cookie from "cookie";
import jwt from "jsonwebtoken";

// utils  imports
import { notFoundHandler, errorHandler } from "./middlewares/errorHandler.js";
import { loggerMiddleware } from "./middlewares/loggerMiddleware.js";
import { dbConnection, db } from "./config/dbConnection.js";
import { logger } from "./services/logger.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
// import locationRoutes from "./routes/locationRoutes.js";
// import vehicleRoutes from "./routes/vehicleRoutes.js";

// Set socket
import { setIO } from "./config/socket.js";

// Allowed origins
const allowedOrigins = [
  "http://localhost:5173",
];
const PORT = process.env.PORT || 5000;

const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 3,
  message: { message: "Too many login attempts, try again later." },
});

// App setup
const app = express();
app.set("trust proxy", 1);
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
  transports: ["polling", "websocket"],
  path: "/socket.io",
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.set("io", io);
setIO(io);

// io.use((socket, next) => {
//   try {
//     const rawCookie =
//       socket.handshake.headers.cookie;

//     if (!rawCookie) {
//       return next(new Error("No cookies"));
//     }

//     const cookies = cookie.parse(rawCookie);

//     const token = cookies.accessToken;

//     if (!token) {
//       return next(new Error("Unauthorized"));
//     }

//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET
//     );

//     socket.userId = decoded.userId;
//     socket.role = decoded.role;

//     next();
//   } catch (err) {
//     console.error("Socket auth error:", err);

//     next(new Error("Unauthorized"));
//   }
// });

// io.on("connection", (socket) => {
//   console.log(`Socket connected: ${socket.id} | User: ${socket.userId} | Role: ${socket.role}`);

//   // Join appropriate room
//   if (socket.role === "admin" || socket.role === "manager") {
//     socket.join("admin_room");
//     console.log(`Admin joined admin_room`);
//   } else if (socket.userId) {
//     socket.join(`user_${socket.userId}`);
//   }

//   // Check-in
//   socket.on("checkIn", async (data) => {
//     console.log("User Checkin SocketEvent: ", data);
//     const userId = socket.userId || data.userId;
//     if (!userId) return;
//     console.log("User Checkin: ", userId);
//   });

//   // Live Location
//   socket.on("sendLocation", async (data) => {
//     const { latitude, longitude, accuracy, speed, heading } = data;
//     console.log("Sendind location event")
//     const userId = socket.userId || data.userId;

//     if (!userId || !latitude || !longitude) return;
//     console.log("Sending Location for User: ", userId);
//     console.log("Location Data: ", { latitude, longitude, accuracy, speed, heading });

//     try {
//       await db.query(
//         `INSERT INTO technician_locations 
//          (user_id, latitude, longitude, accuracy, speed, heading, created_at)
//          VALUES (?, ?, ?, ?, ?, ?, NOW())`,
//         [userId, latitude, longitude, accuracy, speed || 0, heading || 0]
//       );

//       await db.query(
//         `UPDATE users SET current_lat = ?, current_lng = ?, last_location_update = NOW()
//          WHERE id = ?`,
//         [latitude, longitude, userId]
//       );

//       // Broadcast only to admins
//       io.to("admin_room").emit("locationUpdate", {
//         userId,
//         latitude,
//         longitude,
//         accuracy,
//         speed: speed || 0,
//         heading,
//         timestamp: new Date().toISOString()
//       });
//     } catch (err) {
//       console.error("Location error:", err);
//     }
//   });

//   // Check-out
//   socket.on("checkOut", (data) => {
//     io.to("admin_room").emit("userCheckedOut", {
//       userId: socket.userId || data.userId,
//       timestamp: new Date()
//     });
//   });

//   socket.on("disconnect", () => {
//     console.log(`Socket disconnected: ${socket.id}`);
//   });
// });

// CORS configuration

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("CORS blocked:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

// Middlewares
app.use(
  session({
    name: "skylink.sid",
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);
app.use(cors(corsOptions));
app.use("/api/v1/auth/login", authLimiter);
app.use("/api/v1/auth/register", authLimiter);
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", (req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
}, express.static("uploads"));
app.use(loggerMiddleware);
app.use((req, res, next) => {
  req.setTimeout(600000);
  res.setTimeout(600000);
  next();
});

// Database connection
dbConnection();

// Routes
app.get("/", (req, res) => {
  res.send("Nile Computers API Server Running...");
});

app.use("/api/v1/auth", authRoutes);
// app.use("/api/v1/locations", locationRoutes);
// app.use("/api/v1/vehicles", vehicleRoutes);


// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
server.listen(PORT, () => {
  console.info(`Server running on port ${PORT}`);
});
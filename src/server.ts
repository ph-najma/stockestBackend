import { Server } from "socket.io";
import http from "http";
import app from "./app"; // Your express app
import { StockRepository } from "./repositories/stockrepository";
const mongoose = require("mongoose");

const stockrepository = new StockRepository();
const server = http.createServer(app); // Create HTTP server using the express app

const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"],
  },
});
let isCallActive = false;
// interface Session {
//   roomId: string;
//   instructorSocket: string;
//   studentSocket: string;
// }

// const sessions: Session[] = [];
const session2Schema = new mongoose.Schema({
  sessionId: String,
  createdAt: { type: Date, default: Date.now },
});
const Session2 = mongoose.model("Session2", session2Schema);

// Handle client connection for socket.io
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Set an interval to emit stock data and mock updates periodically
  const interval = setInterval(async () => {
    // Fetch live stock data from repository
    const liveStockData = await stockrepository.getAllStocks();
    socket.emit("stockUpdate", liveStockData); // Emit real-time stock data
  }, 5000);
  // Update every 5 seconds

  socket.on("offer", (data) => {
    console.log("Offer received:", data);
    socket.broadcast.emit("offer", data);
  });

  // Handle answer
  socket.on("answer", (data) => {
    console.log("Answer received:", data);
    socket.broadcast.emit("answer", data);
  });

  // Handle ICE candidates
  socket.on("ice-candidate", (candidate) => {
    console.log("ICE candidate received:", candidate);
    socket.broadcast.emit("ice-candidate", candidate);
  });
  socket.on("call-ended", () => {
    console.log("Call ended by client:", socket.id);
    io.emit("call-ended");
  });

  // Session handling
  socket.on("createSession", async (sessionId) => {
    const newSession = new Session2({ sessionId });
    await newSession.save();
    console.log("Session created:", sessionId);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start the combined HTTP server (Express + Socket.IO) on port 5000
server.listen(5000, () => {
  console.log("Server (Express + Socket.IO) running on port 5000");
});

export { io };

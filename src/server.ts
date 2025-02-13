import { Server } from "socket.io";
import http from "http";
import app from "./app"; // Your express app
import { StockRepository } from "./repositories/stockRepository";
const mongoose = require("mongoose");

const stockrepository = new StockRepository();
const server = http.createServer(app); // Create HTTP server using the express app

const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"],
  },
});

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

  // Session handling

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start the combined HTTP server (Express + Socket.IO) on port 5000
server.listen(5000, () => {
  console.log("Server (Express + Socket.IO) running on port 5000");
});

export { io };

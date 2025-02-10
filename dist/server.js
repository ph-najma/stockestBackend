"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app")); // Your express app
const stockrepository_1 = require("./repositories/stockrepository");
const mongoose = require("mongoose");
const stockrepository = new stockrepository_1.StockRepository();
const server = http_1.default.createServer(app_1.default); // Create HTTP server using the express app
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:4200",
        methods: ["GET", "POST"],
    },
});
exports.io = io;
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
    const interval = setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
        // Fetch live stock data from repository
        const liveStockData = yield stockrepository.getAllStocks();
        socket.emit("stockUpdate", liveStockData); // Emit real-time stock data
    }), 5000);
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
    socket.on("createSession", (sessionId) => __awaiter(void 0, void 0, void 0, function* () {
        const newSession = new Session2({ sessionId });
        yield newSession.save();
        console.log("Session created:", sessionId);
    }));
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});
// Start the combined HTTP server (Express + Socket.IO) on port 5000
server.listen(5000, () => {
    console.log("Server (Express + Socket.IO) running on port 5000");
});

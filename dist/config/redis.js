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
exports.client = exports.connectRedis = void 0;
const redis_1 = require("redis");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let client;
const connectRedis = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        exports.client = client = (0, redis_1.createClient)({
            url: process.env.REDIS_URL,
        });
        client.on("error", (err) => console.error("Redis Client Error", err));
        yield client.connect();
        console.log("Redis connected successfully!");
    }
    catch (error) {
        console.error("Error connecting to Redis:", error);
        throw error;
    }
});
exports.connectRedis = connectRedis;

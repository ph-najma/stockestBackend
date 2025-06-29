import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";
import User from "../models/userModel";
import { IUser } from "../interfaces/modelInterface";

dotenv.config();

interface DecodedToken {
  userId: string;
  role: string;
}

// Assuming tokenBlacklist is defined elsewhere in your application
const tokenBlacklist = new Set<string>();

// General Token Verification Middleware with Role Check
export const verifyTokenWithRole = (requiredRole: string) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const token =
        req.headers.authorization && req.headers.authorization.split(" ")[1];

      console.log("token fron auth", token);

      if (!token) {
        res
          .status(401)
          .json({ message: "Unauthorized access. Token missing." });
        return;
      }
      if (tokenBlacklist.has(token)) {
        console.log("Token is blacklisted:", token);
        res
          .status(401)
          .json({ message: "Unauthorized access. Token blacklisted." });
        return;
      }

      jwt.verify(
        token,
        process.env.JWT_SECRET as string,
        async (err, decoded: any) => {
          if (err) {
            console.error("JWT verification error:", err);
            res.status(403).json({ message: "Failed to authenticate token." });
            return;
          }

          const { userId, role: tokenRole } = decoded as DecodedToken;

          const user = (await User.findById(userId)) as IUser | null;
          if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
          }

          if (user.is_Blocked) {
            res.status(403).json({ message: "User is blocked. Logging out." });
            return;
          }

          // Check role from database, not just the token
          if (user.role !== requiredRole) {
            res.status(403).json({ message: "Insufficient permissions." });
            return;
          }

          req.userId = userId;
          req.role = user.role;
          next();
        }
      );
    } catch (error) {
      res.status(500).json({ message: "Internal server error." });
    }
  };
};

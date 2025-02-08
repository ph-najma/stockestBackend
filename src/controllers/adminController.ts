import { Request, Response } from "express";
import { IAdminService } from "../interfaces/Interfaces";
import Order from "../models/orderModel";
import transactionModel from "../models/transactionModel";
import { ILimitOrderQuery } from "../interfaces/Interfaces";
import mongoose from "mongoose";
import { ResponseModel } from "../interfaces/Interfaces";
import { HttpStatusCode } from "../interfaces/Interfaces";
import { IAdminController } from "../interfaces/Interfaces";
export class AdminController implements IAdminController {
  private adminService: IAdminService;

  constructor(adminService: IAdminService) {
    this.adminService = adminService;
  }

  // Admin Login
  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      const { token } = await this.adminService.loginAdmin(email, password);
      const response: ResponseModel = {
        success: true,
        message: "User logged in successfully",
        data: { token },
      };

      res.status(HttpStatusCode.OK).json(response);
    } catch (error: any) {
      const response: ResponseModel = {
        success: false,
        message: error.message,
        error: error.message,
      };
      res.status(HttpStatusCode.BAD_REQUEST).json(response);
    }
  };

  // Get User List
  public getUserList = async (req: Request, res: Response): Promise<void> => {
    try {
      const usersData = await this.adminService.getUserList();
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const skip = (page - 1) * limit;
      const totalUsers = await this.adminService.countUsers();
      const response: ResponseModel = {
        success: true,
        message: "Users retrieved successfully",
        data: {
          usersData,
          totalUsers,
          currentPage: page,
          totalPages: Math.ceil(totalUsers / limit),
        },
      };
      res.status(HttpStatusCode.OK).json(response);
    } catch (error: any) {
      const response: ResponseModel = {
        success: false,
        message: error.message,
        error: error.message,
      };
      res.status(HttpStatusCode.BAD_REQUEST).json(response);
    }
  };

  // Disable User
  public disableUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.id;
      const token = req.headers.authorization?.split(" ")[1];
      const result = await this.adminService.toggleUserBlockStatus(
        userId,
        token
      );
      const response: ResponseModel = {
        success: true,
        message: "User Toggled successfully",
        data: result,
      };
      res.status(HttpStatusCode.OK).json(response);
    } catch (error: any) {
      const response: ResponseModel = {
        success: false,
        message: error.message,
        error: error.message,
      };
      res.status(HttpStatusCode.BAD_REQUEST).json(response);
    }
  };

  // Get Stock List
  public getStockList = async (req: Request, res: Response): Promise<void> => {
    try {
      const stocks = await this.adminService.getAllStocks();
      const response: ResponseModel = {
        success: true,
        message: "Stock list",
        data: stocks,
      };
      res.status(HttpStatusCode.OK).json(response);
    } catch (error: any) {
      const response: ResponseModel = {
        success: false,
        message: error.message,
        error: error.message,
      };
      res.status(HttpStatusCode.BAD_REQUEST).json(response);
    }
  };

  // Get All Orders
  public getAllOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      const orders = await this.adminService.getAllOrders();
      const response: ResponseModel = {
        success: true,
        message: "All Orders",
        data: orders,
      };
      res.status(HttpStatusCode.OK).json(response);
    } catch (error: any) {
      const response: ResponseModel = {
        success: false,
        message: error.message,
        error: error.message,
      };
      res.status(HttpStatusCode.BAD_REQUEST).json(response);
    }
  };

  // Get Limit Orders
  public getLimitOrders = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { status, user, dateRange } = req.query;
      const query: ILimitOrderQuery = { orderType: "LIMIT" };

      if (typeof status === "string" && status !== "all") {
        query.status = status;
      }

      if (user) {
        const userQuery = Array.isArray(user) ? user.join(" ") : user;
        if (typeof userQuery === "string") {
          query.user = { $regex: new RegExp(userQuery, "i") };
        }
      }

      if (dateRange) {
        const date = new Date(dateRange as string);
        query.createdAt = {
          $gte: new Date(date.setHours(0, 0, 0, 0)),
          $lte: new Date(date.setHours(23, 59, 59, 999)),
        };
      }

      const orders = await this.adminService.getLimitOrders(query);
      const response: ResponseModel = {
        success: true,
        message: "Limit Orders",
        data: orders,
      };
      res.status(HttpStatusCode.OK).json(response);
    } catch (error: any) {
      const response: ResponseModel = {
        success: false,
        message: error.message,
        error: error.message,
      };
      res.status(HttpStatusCode.BAD_REQUEST).json(response);
    }
  };

  // Get Market Orders
  public getMarketOrders = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { status, user, dateRange } = req.query;
      const query: ILimitOrderQuery = { orderType: "MARKET" };

      if (typeof status === "string" && status !== "all") {
        query.status = status;
      }

      if (user) {
        const userQuery = Array.isArray(user) ? user.join(" ") : user;

        if (typeof userQuery === "string") {
          query.user = { $regex: new RegExp(userQuery, "i") };
        }
      }

      if (dateRange) {
        const date = new Date(dateRange as string);
        query.createdAt = {
          $gte: new Date(date.setHours(0, 0, 0, 0)),
          $lte: new Date(date.setHours(23, 59, 59, 999)),
        };
      }

      const orders = await this.adminService.getMarketOrders(query);
      const response: ResponseModel = {
        success: true,
        message: "Market orders",
        data: orders,
      };
      res.status(HttpStatusCode.OK).json(response);
    } catch (error: any) {
      const response: ResponseModel = {
        success: false,
        message: error.message,
        error: error.message,
      };
      res.status(HttpStatusCode.BAD_REQUEST).json(response);
    }
  };

  // Matched Orders
  public getMatchedOrders = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const orders = await Order.find({ status: "COMPLETED" })
        .populate("user", "name")
        .populate("stock", "symbol")
        .exec();
      const response: ResponseModel = {
        success: true,
        message: "Matched Orders",
        data: orders,
      };
      res.status(HttpStatusCode.OK).json(orders);
    } catch (error: any) {
      const response: ResponseModel = {
        success: false,
        message: error.message,
        error: error.message,
      };
      res.status(HttpStatusCode.BAD_REQUEST).json(response);
    }
  };

  // Get Order Details
  public getOrderDetails = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const orderId = req.params.orderId;
      const order = await Order.findById(orderId)
        .populate("user")
        .populate("stock")
        .exec();
      const transactions = await transactionModel
        .find({ $or: [{ buyOrder: orderId }, { sellOrder: orderId }] })
        .populate("buyer seller")
        .populate("stock")
        .exec();

      if (!order) {
        res
          .status(HttpStatusCode.NOT_FOUND)
          .json({ message: "Order not found" });
      } else {
        const response: ResponseModel = {
          success: true,
          message: "Order Details",
          data: { order, transactions },
        };
        res.status(HttpStatusCode.OK).json(response);
      }
    } catch (error: any) {
      const response: ResponseModel = {
        success: false,
        message: error.message,
        error: error.message,
      };
      res.status(HttpStatusCode.BAD_REQUEST).json(response);
    }
  };
  public getAllTransactions = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const transactions = await this.adminService.getAllTransactions();
      const response: ResponseModel = {
        success: true,
        message: "All Transactions",
        data: transactions,
      };
      res.status(HttpStatusCode.OK).json(response);
    } catch (error: any) {
      const response: ResponseModel = {
        success: false,
        message: error.message,
        error: error.message,
      };
      res.status(HttpStatusCode.BAD_REQUEST).json(response);
    }
  };

  public getUserPortfolio = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.params.userId;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400).json({ message: "Invalid User ID format" });
      }
      const portfolio = await this.adminService.getUserPortfolio(userId);
      const response: ResponseModel = {
        success: true,
        message: "User Portfolio details",
        data: portfolio,
      };
      res.status(HttpStatusCode.OK).json(response);
    } catch (error: any) {
      const response: ResponseModel = {
        success: false,
        message: error.message,
        error: error.message,
      };
      res.status(HttpStatusCode.BAD_REQUEST).json(response);
    }
  };
  public getTotalFeesCollected = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const fees = await this.adminService.getTotalFeesCollected();
      const response: ResponseModel = {
        success: true,
        message: "Total fees Collected",
        data: fees,
      };
      res.status(HttpStatusCode.OK).json(response);
    } catch (error: any) {
      const response: ResponseModel = {
        success: false,
        message: error.message,
        error: error.message,
      };
      res.status(HttpStatusCode.BAD_REQUEST).json(response);
    }
  };
  public cancelOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const orderId = req.params.orderId;

      const updatedOrder = await this.adminService.cancelOrder(orderId);
      const response: ResponseModel = {
        success: true,
        message: "Order status updated to FAILED successfully",
        data: updatedOrder,
      };
      res.status(HttpStatusCode.OK).json(response);
    } catch (error: any) {
      const response: ResponseModel = {
        success: false,
        message: error.message,
        error: error.message,
      };
      res.status(HttpStatusCode.BAD_REQUEST).json(response);
    }
  };
  public updateLimit = async (req: Request, res: Response): Promise<void> => {
    try {
      const limitData = req.body;

      const updatedLimit = await this.adminService.updateLimit(limitData);
      const response: ResponseModel = {
        success: true,
        message: "Updated limit",
        data: updatedLimit,
      };
      res.status(HttpStatusCode.OK).json(response);
    } catch (error: any) {
      const response: ResponseModel = {
        success: false,
        message: error.message,
        error: error.message,
      };
      res.status(HttpStatusCode.BAD_REQUEST).json(response);
    }
  };
  public getLimits = async (req: Request, res: Response): Promise<void> => {
    try {
      const limits = await this.adminService.getLimits();
      const response: ResponseModel = {
        success: true,
        message: "Current liits",
        data: limits,
      };
      res.status(HttpStatusCode.OK).json(response);
    } catch (error: any) {
      const response: ResponseModel = {
        success: false,
        message: error.message,
        error: error.message,
      };
      res.status(HttpStatusCode.BAD_REQUEST).json(response);
    }
  };
  public CreatePromotions = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const promotions = await this.adminService.CreatePromotions(req.body);
      const response: ResponseModel = {
        success: true,
        message: "Promotion created successfully",
        data: promotions,
      };
      res.status(HttpStatusCode.CREATED).json(response);
    } catch (error: any) {
      const response: ResponseModel = {
        success: false,
        message: error.message,
        error: error.message,
      };
      res.status(HttpStatusCode.BAD_REQUEST).json(response);
    }
  };
  public createSession = async (req: Request, res: Response): Promise<void> => {
    try {
      const session = await this.adminService.createSsession(req.body);

      const response: ResponseModel = {
        success: true,
        message: "Session created successfully",
        data: session,
      };
      res.status(HttpStatusCode.CREATED).json(response);
    } catch (error: any) {
      const response: ResponseModel = {
        success: false,
        message: error.message,
        error: error.message,
      };
      res.status(HttpStatusCode.BAD_REQUEST).json(response);
    }
  };
  public getAllSessions = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const sessions = await this.adminService.getAllSessions();
      const response: ResponseModel = {
        success: true,
        message: "Session got successfully",
        data: sessions,
      };
      res.status(HttpStatusCode.OK).json(response);
    } catch (error: any) {
      const response: ResponseModel = {
        success: false,
        message: error.message,
        error: error.message,
      };
      res.status(HttpStatusCode.BAD_REQUEST).json(response);
    }
  };
  public getSessionById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const sessionId = req.params.sessionId;
      const session = await this.adminService.getSessionById(sessionId);
      const response: ResponseModel = {
        success: true,
        message: "Session got successfully",
        data: session,
      };
      res.status(HttpStatusCode.OK).json(response);
    } catch (error: any) {
      const response: ResponseModel = {
        success: false,
        message: error.message,
        error: error.message,
      };
      res.status(HttpStatusCode.BAD_REQUEST).json(response);
    }
  };
  public updateSessionData = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const sessionId = req.params.sessionId;
      const updatedSession = await this.adminService.updateSessionData(
        sessionId,
        req.body
      );
      const response: ResponseModel = {
        success: true,
        message: "Session updated successfully",
        data: updatedSession,
      };
      res.status(HttpStatusCode.CREATED).json(updatedSession);
    } catch (error: any) {
      const response: ResponseModel = {
        success: false,
        message: error.message,
        error: error.message,
      };
      res.status(HttpStatusCode.BAD_REQUEST).json(response);
    }
  };
  public cancelSession = async (req: Request, res: Response): Promise<void> => {
    try {
      const sessionId = req.params.id;
      const { status } = req.body;

      const updatedSession = await this.adminService.cancelSession(
        sessionId,
        status
      );
      const response: ResponseModel = {
        success: true,
        message: "Session cancelled successfully",
        data: updatedSession,
      };

      res.status(HttpStatusCode.OK).json(response);
    } catch (error: any) {
      const response: ResponseModel = {
        success: false,
        message: error.message,
        error: error.message,
      };
      res.status(HttpStatusCode.BAD_REQUEST).json(response);
    }
  };
}

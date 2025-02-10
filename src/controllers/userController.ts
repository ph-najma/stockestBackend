import { Request, Response } from "express";
import { IUserService } from "../interfaces/Interfaces";
import mongoose from "mongoose";
import Stock from "../models/stockModel";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ResponseModel } from "../interfaces/Interfaces";
import { HttpStatusCode } from "../interfaces/Interfaces";
import { IUserController } from "../interfaces/Interfaces";
import { S3Service } from "../s3.service";
export class UserController implements IUserController {
  private userService: IUserService;

  constructor(userService: IUserService) {
    this.userService = userService;
  }
  s3Service = new S3Service();

  //signup
  public signup = async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, role } = req.body;
    try {
      await this.userService.signup(name, email, password, role);
      const response: ResponseModel = {
        success: true,
        message: "OTP sent to email",
        data: email,
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
  //verify OTP
  public verifyOtp = async (req: Request, res: Response): Promise<void> => {
    const { otp } = req.body;
    try {
      const result = await this.userService.verifyOtp(otp);
      const response: ResponseModel = {
        success: true,
        message: "OTP verified",
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
  //Resend OTP
  public resendOtp = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    try {
      const message = await this.userService.resendOtp(email);
      const response: ResponseModel = {
        success: true,
        message: "OTP resended",
        data: message,
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
  //Login
  public login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    try {
      const result = await this.userService.login(email, password);
      const response: ResponseModel = {
        success: true,
        message: "Logged In successfully",
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
  //Forgot Password
  public forgotPassword = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { email } = req.body;
    try {
      await this.userService.forgotPassword(email);
      const response: ResponseModel = {
        success: true,
        message: "OTP sent to email",
        data: email,
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
  //Reset Password
  public resetPassword = async (req: Request, res: Response): Promise<void> => {
    const { email, otp, newPassword } = req.body;
    try {
      await this.userService.resetPassword(email, otp, newPassword);
      const response: ResponseModel = {
        success: true,
        message: "Password resetted sucessfully",
        data: email,
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

  public getStockList = async (req: Request, res: Response): Promise<void> => {
    try {
      const stocks = await this.userService.getAllStocks();
      const response: ResponseModel = {
        success: true,
        message: "Stocklist",
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
  //User Profile
  public getUserProfile = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const fileKey = req.query.key as string;
      const user = await this.userService.getUserProfile(req.userId);
      const signedUrl = await this.s3Service.generateDownloadURL(fileKey);
      const response: ResponseModel = {
        success: true,
        message: "User profile",
        data: { user, signedUrl },
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

  //User Portfolio
  public getUserportfolio = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const user = await this.userService.getUserPortfolio(req.userId);
      if (!user) {
        res
          .status(HttpStatusCode.NOT_FOUND)
          .json({ message: "User not found" });
        return;
      }
      let totalPortfolioValue = 0;
      let overallProfit = 0;
      let todaysProfit = 0;
      const updatedPortfolio = await Promise.all(
        user.portfolio.map(async (item) => {
          const stock = await this.userService.getStockById(
            item.stockId instanceof mongoose.Types.ObjectId
              ? item.stockId.toString()
              : item.stockId
          );
          if (!stock) return item;

          const stockValue = stock.price * item.quantity;
          const profit = stockValue - stock.open * item.quantity;
          const todaysChange = stock.changePercent;

          totalPortfolioValue += stockValue;
          overallProfit += profit;
          todaysProfit += (profit * parseFloat(todaysChange)) / 100;

          return {
            ...item,
            stockData: stock,
            currentValue: stockValue,
            overallProfit: profit,
            todaysProfit,
          };
        })
      );

      const response: ResponseModel = {
        success: true,
        message: "User portfolio",
        data: {
          portfolio: updatedPortfolio,
          totalPortfolioValue,
          overallProfit,
          todaysProfit,
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
  //placeOrder
  public placeOrder = async (req: Request, res: Response): Promise<void> => {
    const { stock, type, orderType, quantity, price, stopPrice, isIntraday } =
      req.body;
    const user = req.userId
      ? new mongoose.Types.ObjectId(req.userId)
      : undefined;

    const order = await this.userService.placeOrder(
      user,
      stock,
      type,
      orderType,
      quantity,
      price,
      stopPrice,
      isIntraday
    );
    const response: ResponseModel = {
      success: true,
      message: "Order placed",
      data: order,
    };
    res.status(HttpStatusCode.OK).json(response);
  };
  //Get Watchlist
  public getWatchlist = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId;
      const watchlist = await this.userService.getWatchlist(userId);
      const response: ResponseModel = {
        success: true,
        message: "Watchlist",
        data: watchlist,
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

  //Transaction
  public getTransaction = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const transactions = await this.userService.getTransactions(req.userId);
      const response: ResponseModel = {
        success: true,
        message: "Transactions details",
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
  public updatePortfolioAfterSell = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { userId, stockId, quantityToSell } = req.body;
      const updatedData = await this.userService.updatePortfolioAfterSell(
        userId,
        stockId,
        quantityToSell
      );
      const response: ResponseModel = {
        success: true,
        message: "Updated Portfolio After sell",
        data: updatedData,
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
  public ensureWatchlistAndAddStock = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.userId;
      const { stocks } = req.body;

      const stockId = stocks[0]?.stockId;

      const stock = await Stock.findOne({ symbol: stockId });

      const updatedWathclist =
        await this.userService.ensureWatchlistAndAddStock(userId, stockId);
      const response: ResponseModel = {
        success: true,
        message: "Added stock to watchlist",
        data: updatedWathclist,
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
  public getStockData = async (req: Request, res: Response): Promise<void> => {
    try {
      const symbol = req.query.symbol;
      const updatedSymbol = symbol?.toString();
      const stockData = await this.userService.getStockData(updatedSymbol);
      const response: ResponseModel = {
        success: true,
        message: "StockData",
        data: stockData,
      };
      console.log(response);
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
  public getHistorical = async (req: Request, res: Response): Promise<void> => {
    try {
      const symbol = req.query.symbol;
      const updatedSymbol = symbol?.toString();
      const stockData = await this.userService.getHistorical(updatedSymbol);
      const response: ResponseModel = {
        success: true,
        message: "History stock data",
        data: stockData,
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
  public getReferralCode = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const userId = req.userId;
    const referralCode = await this.userService.getReferralCode(userId);
    const response: ResponseModel = {
      success: true,
      message: "Referral code",
      data: referralCode,
    };
    res.status(HttpStatusCode.OK).json(response);
  };
  public getOrders = async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10; // Default to 10 items per page

    const skip = (page - 1) * limit;
    const totalOrders = await this.userService.countOrders(userId);
    const orders = await this.userService.getOrders(userId, skip, limit);
    const response: ResponseModel = {
      success: true,
      message: "All Orders",
      data: {
        orders,
        totalOrders,
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
      },
    };
    res.status(HttpStatusCode.OK).json(response);
  };
  public getPromotions = async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId;
    const user = await this.userService.getUserProfileWithRewards(userId);
    const response: ResponseModel = {
      success: true,
      message: "Promotions for the user",
      data: user,
    };
    res.status(HttpStatusCode.OK).json(response);
  };
  public getTradeDiary = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId;

      const tradeData = await this.userService.getTradeDiary(userId);
      const response: ResponseModel = {
        success: true,
        message: "Trade Data",
        data: tradeData,
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

  public getActiveSessions = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const sessionData = await this.userService.getActiveSessions();
      const response: ResponseModel = {
        success: true,
        message: "Active sessions",
        data: sessionData,
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
  public getPurchased = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId;
      const sessionData = await this.userService.getPurchased(userId);
      const response: ResponseModel = {
        success: true,
        message: "Purchased sessions",
        data: sessionData,
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
  public getAssigned = async (req: Request, res: Response): Promise<void> => {
    try {
      const intructorId = req.userId;
      const sessionData = await this.userService.getAssignedSession(
        intructorId
      );

      const response: ResponseModel = {
        success: true,
        message: "Purchased sessions",
        data: sessionData,
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

  public getBySearch = async (req: Request, res: Response): Promise<void> => {
    try {
      const { symbol, startDate, endDate, minPrice, maxPrice } = req.query;

      const query: any = {};
      if (symbol) query.symbol = { $regex: symbol, $options: "i" };
      if (startDate) query.timestamp = { $gte: new Date(startDate as string) };
      if (endDate)
        query.timestamp = {
          ...query.timestamp,
          $lte: new Date(endDate as string),
        };
      if (minPrice) query.price = { $gte: parseFloat(minPrice as string) };
      if (maxPrice)
        query.price = { ...query.price, $lte: parseFloat(maxPrice as string) };

      const stocks = await this.userService.getBySearch(query);
      const response: ResponseModel = {
        success: true,
        message: "Searched stocks",
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
  public generate = async (req: Request, res: Response): Promise<void> => {
    const { prompt } = req.body;

    if (!prompt) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ error: "Prompt is required." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ error: "GEMINI_API_KEY is not set." });
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey as string);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);

      res.json({ response: result.response.text() });
    } catch (error) {
      console.error("Error generating content:", error);
      res.status(500).json({ error: "Failed to generate content." });
    }
  };
  public refreshToken = async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ error: "Refresh token is required." });
    }
    const newToken = await this.userService.refreshToken(refreshToken);

    const response: ResponseModel = {
      success: true,
      message: "Searched stocks",
      data: newToken,
    };
    res.status(HttpStatusCode.OK).json(response);
  };
  public createVideoSession = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { instructorId } = req.body;
    const sessionId = await this.userService.createVideoSession(instructorId);
    res.json({ sessionId });
  };
  public getUploadURL = async (req: Request, res: Response): Promise<void> => {
    try {
      const uploadURL = await this.s3Service.generateUploadURL();
      res.status(200).json({ uploadURL });
    } catch (error) {
      res.status(500).json({ error: "Error generating upload URL" });
    }
  };
  public getDownloadUrl = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const fileKey = req.query.key as string;
    try {
      const signedUrl = await this.s3Service.generateDownloadURL(fileKey);
      res.json(signedUrl);
    } catch (error) {
      res.status(500).json({ error: "Failed to get download URL" });
    }
  };
}

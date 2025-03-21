import { Request, Response } from "express";
import { IUserService } from "../interfaces/serviceInterface";
import mongoose from "mongoose";
import Stock from "../models/stockModel";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ResponseModel } from "../interfaces/Interfaces";
import { HttpStatusCode } from "../interfaces/Interfaces";
import { IUserController } from "../interfaces/controllerInterfaces";
import multer from "multer";
import AWS from "aws-sdk";
import sendResponse from "../helper/helper";
import User from "../models/userModel";
import dotenv from "dotenv";
import { MESSAGES } from "../helper/Message";

dotenv.config();

export class UserController implements IUserController {
  private userService: IUserService;

  constructor(userService: IUserService) {
    this.userService = userService;
  }

  s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });
  upload = multer({ storage: multer.memoryStorage() });

  //signup
  public signup = async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, role } = req.body;
    try {
      await this.userService.signup(name, email, password, role);
      sendResponse(res, HttpStatusCode.OK, true, MESSAGES.LOGIN_SUCCESS, email);
    } catch (error: any) {
      sendResponse(
        res,
        HttpStatusCode.BAD_REQUEST,
        false,
        error.message,
        null,
        error
      );
    }
  };
  //verify OTP
  public verifyOtp = async (req: Request, res: Response): Promise<void> => {
    const { otp } = req.body;
    try {
      const result = await this.userService.verifyOtp(otp);

      sendResponse(res, HttpStatusCode.OK, true, MESSAGES.OTP_VERIFY, result);
    } catch (error: any) {
      sendResponse(
        res,
        HttpStatusCode.BAD_REQUEST,
        false,
        error.message,
        null,
        error
      );
    }
  };
  //Resend OTP
  public resendOtp = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    try {
      const message = await this.userService.resendOtp(email);
      sendResponse(res, HttpStatusCode.OK, true, MESSAGES.OTP_RESEND, message);
    } catch (error: any) {
      sendResponse(
        res,
        HttpStatusCode.BAD_REQUEST,
        false,
        error.message,
        null,
        error
      );
    }
  };
  //Login
  public login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    try {
      const result = await this.userService.login(email, password);
      sendResponse(
        res,
        HttpStatusCode.OK,
        true,
        MESSAGES.LOGIN_SUCCESS,
        result
      );
    } catch (error: any) {
      sendResponse(
        res,
        HttpStatusCode.BAD_REQUEST,
        false,
        error.message,
        null,
        error
      );
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
      sendResponse(res, HttpStatusCode.OK, true, MESSAGES.OTP_SENT, email);
    } catch (error: any) {
      sendResponse(
        res,
        HttpStatusCode.BAD_REQUEST,
        false,
        error.message,
        null,
        error
      );
    }
  };
  //Reset Password
  public resetPassword = async (req: Request, res: Response): Promise<void> => {
    const { email, otp, newPassword } = req.body;
    try {
      await this.userService.resetPassword(email, otp, newPassword);

      sendResponse(
        res,
        HttpStatusCode.OK,
        true,
        MESSAGES.PASSWORD_RESET,
        email
      );
    } catch (error: any) {
      sendResponse(
        res,
        HttpStatusCode.BAD_REQUEST,
        false,
        error.message,
        null,
        error
      );
    }
  };

  public getStockList = async (req: Request, res: Response): Promise<void> => {
    try {
      const stocks = await this.userService.getAllStocks();
      sendResponse(res, HttpStatusCode.OK, true, MESSAGES.STOCK_LIST, stocks);
    } catch (error: any) {
      sendResponse(
        res,
        HttpStatusCode.BAD_REQUEST,
        false,
        error.message,
        null,
        error
      );
    }
  };
  //User Profile
  public getUserProfile = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const user = await this.userService.getUserProfile(req.userId);
      sendResponse(res, HttpStatusCode.OK, true, MESSAGES.USER_PROFILE, user);
    } catch (error: any) {
      sendResponse(
        res,
        HttpStatusCode.BAD_REQUEST,
        false,
        error.message,
        null,
        error
      );
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

      const portfolioData = await this.userService.getUpdatedPortfolio(user);
      sendResponse(
        res,
        HttpStatusCode.OK,
        true,
        MESSAGES.USER_PORTFOLIO,
        portfolioData
      );
    } catch (error: any) {
      sendResponse(
        res,
        HttpStatusCode.BAD_REQUEST,
        false,
        error.message,
        null,
        error
      );
    }
  };
  //placeOrder
  public placeOrder = async (req: Request, res: Response): Promise<void> => {
    try {
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
      sendResponse(res, HttpStatusCode.OK, true, MESSAGES.PLACE_ORDER, order);
    } catch (error: any) {
      sendResponse(
        res,
        HttpStatusCode.BAD_REQUEST,
        false,
        error.message,
        null,
        error
      );
    }
  };
  //Get Watchlist
  public getWatchlist = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId;
      const watchlist = await this.userService.getWatchlist(userId);

      sendResponse(res, HttpStatusCode.OK, true, MESSAGES.WATCHLIST, watchlist);
    } catch (error: any) {
      sendResponse(
        res,
        HttpStatusCode.BAD_REQUEST,
        false,
        error.message,
        null,
        error
      );
    }
  };

  //Transaction
  public getTransaction = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const skip = (page - 1) * limit;
      const transactions = await this.userService.getTransactions(
        req.userId,
        skip,
        limit
      );

      sendResponse(
        res,
        HttpStatusCode.OK,
        true,
        MESSAGES.TRANSACTIONS_RETRIEVED,

        transactions
      );
    } catch (error: any) {
      sendResponse(
        res,
        HttpStatusCode.BAD_REQUEST,
        false,
        error.message,
        null,
        error
      );
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

      sendResponse(
        res,
        HttpStatusCode.OK,
        true,
        MESSAGES.PORTFOLIO_UPDATION,
        updatedData
      );
    } catch (error: any) {
      sendResponse(
        res,
        HttpStatusCode.BAD_REQUEST,
        false,
        error.message,
        null,
        error
      );
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

      const updatedWathclist =
        await this.userService.ensureWatchlistAndAddStock(userId, stockId);

      sendResponse(
        res,
        HttpStatusCode.OK,
        true,
        MESSAGES.ADD_TO_WATCHLIST,
        updatedWathclist
      );
    } catch (error: any) {
      sendResponse(
        res,
        HttpStatusCode.BAD_REQUEST,
        false,
        error.message,
        null,
        error
      );
    }
  };
  public getStockData = async (req: Request, res: Response): Promise<void> => {
    try {
      const symbol = req.query.symbol;
      const updatedSymbol = symbol?.toString();
      const stockData = await this.userService.getStockData(updatedSymbol);
      sendResponse(
        res,
        HttpStatusCode.OK,
        true,
        MESSAGES.STOCK_LIST,
        stockData
      );
    } catch (error: any) {
      sendResponse(
        res,
        HttpStatusCode.BAD_REQUEST,
        false,
        error.message,
        null,
        error
      );
    }
  };
  public getHistorical = async (req: Request, res: Response): Promise<void> => {
    try {
      const symbol = req.query.symbol;
      const updatedSymbol = symbol?.toString();
      const stockData = await this.userService.getHistorical(updatedSymbol);
      sendResponse(
        res,
        HttpStatusCode.OK,
        true,
        MESSAGES.STOCK_HISTORY,
        stockData
      );
    } catch (error: any) {
      sendResponse(
        res,
        HttpStatusCode.BAD_REQUEST,
        false,
        error.message,
        null,
        error
      );
    }
  };

  public getOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId;
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10; // Default to 10 items per page

      const skip = (page - 1) * limit;
      const totalOrders = await this.userService.countOrders(userId);
      const orders = await this.userService.getOrders(userId, skip, limit);

      sendResponse(res, HttpStatusCode.OK, true, MESSAGES.ALL_ORDERS, {
        orders,
        totalOrders,
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
      });
    } catch (error: any) {
      sendResponse(
        res,
        HttpStatusCode.BAD_REQUEST,
        false,
        error.message,
        null,
        error
      );
    }
  };
  public getPromotions = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId;
      const user = await this.userService.getUserProfileWithRewards(userId);

      sendResponse(res, HttpStatusCode.OK, true, MESSAGES.USER_PROMOTION, user);
    } catch (error: any) {
      sendResponse(
        res,
        HttpStatusCode.BAD_REQUEST,
        false,
        error.message,
        null,
        error
      );
    }
  };
  public getTradeDiary = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId;
      const tradeData = await this.userService.getTradeDiary(userId);
      sendResponse(
        res,
        HttpStatusCode.OK,
        true,
        MESSAGES.TRADE_DIARY_DATA,
        tradeData
      );
    } catch (error: any) {
      sendResponse(
        res,
        HttpStatusCode.BAD_REQUEST,
        false,
        error.message,
        null,
        error
      );
    }
  };

  public getActiveSessions = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const sessionData = await this.userService.getActiveSessions();
      sendResponse(
        res,
        HttpStatusCode.OK,
        true,
        MESSAGES.ACTIVE_SESSIONS,
        sessionData
      );
    } catch (error: any) {
      sendResponse(
        res,
        HttpStatusCode.BAD_REQUEST,
        false,
        error.message,
        null,
        error
      );
    }
  };
  public getPurchased = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId;
      const sessionData = await this.userService.getPurchased(userId);

      sendResponse(
        res,
        HttpStatusCode.OK,
        true,
        MESSAGES.PURCHASED_SESSIONS,
        sessionData
      );
    } catch (error: any) {
      sendResponse(
        res,
        HttpStatusCode.BAD_REQUEST,
        false,
        error.message,
        null,
        error
      );
    }
  };
  public getAssigned = async (req: Request, res: Response): Promise<void> => {
    try {
      const intructorId = req.userId;
      const sessionData = await this.userService.getAssignedSession(
        intructorId
      );

      sendResponse(
        res,
        HttpStatusCode.OK,
        true,
        MESSAGES.ASSIGNED_SESSIONS,
        sessionData
      );
    } catch (error: any) {
      sendResponse(
        res,
        HttpStatusCode.BAD_REQUEST,
        false,
        error.message,
        null,
        error
      );
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

      sendResponse(
        res,
        HttpStatusCode.OK,
        true,
        MESSAGES.SEARCH_RESULT,
        stocks
      );
    } catch (error: any) {
      sendResponse(
        res,
        HttpStatusCode.BAD_REQUEST,
        false,
        error.message,
        null,
        error
      );
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
    } catch (error: any) {
      sendResponse(
        res,
        HttpStatusCode.BAD_REQUEST,
        false,
        error.message,
        null,
        error
      );
    }
  };
  public refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res
          .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
          .json({ error: "Refresh token is required." });
      }
      const newToken = await this.userService.refreshToken(refreshToken);

      sendResponse(
        res,
        HttpStatusCode.OK,
        true,
        MESSAGES.REFRESH_TOKEN,
        newToken
      );
    } catch (error: any) {
      sendResponse(
        res,
        HttpStatusCode.BAD_REQUEST,
        false,
        error.message,
        null,
        error
      );
    }
  };
  public getSignedUrl = async (req: Request, res: Response): Promise<any> => {
    const { fileName, fileType } = req.query;

    if (!fileName || !fileType) {
      return res.status(400).json({ error: "Missing fileName or fileType" });
    }

    const params = {
      Bucket: process.env.S3_BUCKET_NAME as string,
      Key: `profiles/${fileName}`,
      Expires: 3600,
      ContentType: fileType,
    };
    try {
      const signedUrl = await this.s3.getSignedUrlPromise("putObject", params);
      console.log(signedUrl);
      res.json({
        signedUrl,
        fileUrl: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/profiles/${fileName}`,
      });
    } catch (error: any) {
      sendResponse(
        res,
        HttpStatusCode.BAD_REQUEST,
        false,
        error.message,
        null,
        error
      );
    }
  };

  public saveProfile = async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId;
    const user = await User.findById(userId);
    const email = user?.email;
    console.log(email);
    const { profileImageUrl } = req.body;
    console.log(profileImageUrl);
    try {
      const user = await User.findOneAndUpdate(
        { email },
        { profilePhoto: profileImageUrl },
        { new: true, upsert: true }
      );

      res.json({ message: "Profile updated successfully", user });
    } catch (error: any) {
      sendResponse(
        res,
        HttpStatusCode.BAD_REQUEST,
        false,
        error.message,
        null,
        error
      );
    }
  };
  public getNotifications = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.userId;
      const notificationData = await this.userService.getNotifications(userId);

      sendResponse(
        res,
        HttpStatusCode.OK,
        true,
        MESSAGES.PURCHASED_SESSIONS,
        notificationData
      );
    } catch (error: any) {
      sendResponse(
        res,
        HttpStatusCode.BAD_REQUEST,
        false,
        error.message,
        null,
        error
      );
    }
  };
}

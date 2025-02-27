import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { ILimitOrderQuery } from "../interfaces/Interfaces";
import { IAdminService } from "../interfaces/serviceInterface";
import {
  IUser,
  ITransaction,
  IStock,
  ISession,
  IOrder,
  ILimit,
} from "../interfaces/modelInterface";
import {
  ITransactionRepository,
  IStockRepository,
  ISessionRepository,
  IpromotionRepsoitory,
  IOrderRepository,
  ILimitRepository,
  IuserRepsitory,
} from "../interfaces/repositoryInterface";
dotenv.config();

const tokenBlacklist = new Set<string>();

export class AdminService implements IAdminService {
  private userRepository: IuserRepsitory;
  private orderRepository: IOrderRepository;
  private stockRepository: IStockRepository;
  private transactionRepository: ITransactionRepository;
  private limitRepository: ILimitRepository;
  private promotionRepository: IpromotionRepsoitory;
  private sessionRepository: ISessionRepository;
  constructor(
    userRepository: IuserRepsitory,
    limitRepository: ILimitRepository,
    orderRepository: IOrderRepository,
    stockRepository: IStockRepository,
    transactionRepository: ITransactionRepository,
    promotionRepository: IpromotionRepsoitory,
    sessionRepository: ISessionRepository
  ) {
    this.userRepository = userRepository;
    this.orderRepository = orderRepository;
    this.stockRepository = stockRepository;
    this.transactionRepository = transactionRepository;
    this.limitRepository = limitRepository;
    this.promotionRepository = promotionRepository;
    this.sessionRepository = sessionRepository;
  }

  // Admin Login
  async loginAdmin(
    email: string,
    password: string
  ): Promise<{ token: string }> {
    const existingUser = await this.userRepository.findAdminByEmail(email);
    if (!existingUser) {
      throw new Error("No such user");
    }

    const isMatch = await existingUser.comparePassword(password);
    if (!isMatch) {
      throw new Error("Invalid password");
    }

    const token = jwt.sign(
      { userId: existingUser._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    return { token };
  }

  // Get User List
  async getUserList(): Promise<IUser[]> {
    return await this.userRepository.findAllUsers();
  }

  // Disable or Enable User
  async toggleUserBlockStatus(
    userId: string,
    token?: string
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    user.is_Blocked = !user.is_Blocked;
    await this.userRepository.saveUser(user);

    if (token) {
      tokenBlacklist.add(token);
    }

    return {
      message: `${
        user.is_Blocked ? "Blocked" : "Unblocked"
      } user successfully.`,
    };
  }
  async countUsers(): Promise<number> {
    return await this.userRepository.countUser();
  }
  //Get All Orders
  async getAllOrders(): Promise<IOrder[]> {
    return this.orderRepository.getAllOrders();
  }
  //Get Limit Orders

  async getLimitOrders(query: ILimitOrderQuery) {
    query.orderType = "LIMIT";
    return this.orderRepository.findOrdersByType(query);
  }
  //Get Market Orders

  async getMarketOrders(query: ILimitOrderQuery) {
    query.orderType = "MARKET";
    return this.orderRepository.findOrdersByType(query);
  }
  //Get Completed Orders

  async getCompletedOrders(): Promise<IOrder[]> {
    return this.orderRepository.findCompletedOrders();
  }

  //Get All Stocks
  async getAllStocks(): Promise<IStock[]> {
    return this.stockRepository.getAllStocks();
  }

  //Get All Transactiosn
  async getAllTransactions(): Promise<ITransaction[]> {
    return this.transactionRepository.getAllTransactions();
  }

  //Get UserPortfolio
  async getUserPortfolio(userId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const user = await this.userRepository.findById(userObjectId);
    if (!user) {
      throw new Error("User not found");
    }
    const portfolio = user.portfolio as {
      stockId: mongoose.Types.ObjectId;
      quantity: number;
    }[];
    const portfolioDetails = await Promise.all(
      portfolio.map(async (item) => {
        const stockId = item.stockId; // Convert ObjectId to string
        const stock = await this.stockRepository.getStockById(stockId);
        return {
          stock,
          quantity: item.quantity,
        };
      })
    );
    return {
      user: {
        name: user.name,
        email: user.email,
        balance: user.balance,
      },
      portfolio: portfolioDetails,
    };
  }
  //Get Total Fees Collected
  async getTotalFeesCollected(): Promise<number> {
    return this.transactionRepository.getFeeCollectionSummary();
  }

  // Cancel Order
  async cancelOrder(orderId: string): Promise<IOrder | null> {
    return this.orderRepository.cancelOrder(orderId);
  }

  //Update the Limits
  async updateLimit(limitData: Partial<ILimit>): Promise<ILimit | null> {
    return await this.limitRepository.updateLimit(limitData);
  }
  //Get the Current Limits
  async getLimits(): Promise<ILimit | null> {
    return await this.limitRepository.getLimits();
  }

  async CreatePromotions(data: any): Promise<any> {
    return await this.promotionRepository.createPromotion(data);
  }

  async createSsession(data: ISession): Promise<ISession | null> {
    const session = await this.sessionRepository.createSession(data);

    return session;
  }
  async getAllSessions(): Promise<ISession[] | null> {
    return await this.sessionRepository.getAllSessions();
  }
  async getSessionById(sessionId: string): Promise<ISession | null> {
    return await this.sessionRepository.getSessionById(sessionId);
  }
  async updateSessionData(
    sessionId: string,
    data: Partial<ISession>
  ): Promise<ISession | null> {
    return await this.sessionRepository.updateSession(sessionId, data);
  }
  async cancelSession(
    sessionId: string,
    newStatus: "SCHEDULED" | "COMPLETED" | "CANCELED"
  ): Promise<ISession | null> {
    return await this.sessionRepository.updateSessionStatus(
      sessionId,
      newStatus
    );
  }
}

import mongoose, { Types, FilterQuery, UpdateQuery, Document } from "mongoose";
import { Request, Response } from "express";
import {
  ITransaction,
  ILimit,
  IWatchlist,
  ISession,
  IStock,
  ISignupBonus,
  IUser,
  IOrder,
  IPromotion,
} from "./modelInterface";
import { ILimitOrderQuery } from "./Interfaces";
export interface IBaseRepository<T> {
  // Find by ID
  findById(id: string | undefined): Promise<T | null>;

  // Find one
  findOne(filter: FilterQuery<T>): Promise<T | null>;

  // Find all
  findAll(filter?: FilterQuery<T>): Promise<T[]>;

  // Create
  create(data: Partial<T>): Promise<T>;

  // Update by ID
  updateById(
    id: string | undefined,
    updateData: UpdateQuery<T>
  ): Promise<T | null>;

  // Delete by ID
  deleteById(id: string): Promise<T | null>;
}

export interface ILimitRepository {
  updateLimit(limitData: Partial<ILimit>): Promise<ILimit | null>;
  getLimits(): Promise<ILimit | null>;
}
export interface IOrderRepository extends IBaseRepository<IOrder> {
  findById(orderId: string): Promise<IOrder | null>;
  findOrders(
    UserId: string | undefined,
    skip: number,
    limit: number
  ): Promise<IOrder[] | null>;
  findCompletedOrders(): Promise<IOrder[]>;
  findOrdersByType(query: ILimitOrderQuery): Promise<IOrder[]>;
  // createOrder(orderData: Partial<IOrder>): Promise<IOrder>;
  getAllOrders(): Promise<IOrder[]>;
  cancelOrder(orderId: string): Promise<IOrder | null>;
  countOrdersByUser(userId: string | undefined): Promise<number>;
}

export interface IpromotionRepsoitory {
  createPromotion(data: any): Promise<any>;
  findPromotion(): Promise<any>;
}

export interface ISessionRepository {
  createSession(sessionData: ISession): Promise<ISession>;
  getSessionById(sessionId: string): Promise<ISession | null>;
  updateSession(
    sessionId: string,
    sessionData: Partial<ISession>
  ): Promise<ISession | null>;
  getAllSessions(): Promise<ISession[]>;
  updateSessionStatus(
    sessionId: string,
    newStatus: "SCHEDULED" | "COMPLETED" | "CANCELED"
  ): Promise<ISession | null>;
  getActiveSessions(): Promise<ISession[]>;
  assignStudent(
    sessionId: string,
    student_id: string | undefined
  ): Promise<ISession | null>;
  getPurchased(userId: string | undefined): Promise<ISession[]>;
  getAssigned(Instructoremail: string | undefined): Promise<ISession[] | null>;
}

export interface IStockRepository {
  getAllStocks(): Promise<IStock[]>;
  createStock(stockData: Partial<IStock>): Promise<IStock>;
  getStockById(
    stockId: string | mongoose.Types.ObjectId | undefined
  ): Promise<IStock | null>;
  updateStock(
    stockId: string,
    updatedData: Partial<IStock>
  ): Promise<IStock | null>;
  deleteStock(stockId: string): Promise<void>;
  getMarketPrice(symbol: string): Promise<any>;
  getStockData(symbol: string | undefined): Promise<IStock[]>;
  searchStocks(query: Partial<IStock>): Promise<IStock[]>;
}

export interface ITransactionRepository {
  getTransactions(userId: string | undefined): Promise<ITransaction[]>;
  getAllTransactions(): Promise<ITransaction[]>;
  getFeeCollectionSummary(): Promise<number>;
  getTradeDiary(userId: string | undefined): Promise<any>;
}

export interface IuserRepsitory {
  findByEmail(email: string): Promise<IUser | null>;
  findByOtp(otp: string): Promise<IUser | null>;
  findById(
    userId: string | mongoose.Types.ObjectId | undefined
  ): Promise<IUser | null>;
  save(userData: Partial<IUser>): Promise<IUser>;
  updateById(userId: string, updateData: Partial<IUser>): Promise<IUser | null>;
  updatePassword(email: string, newPassword: string): Promise<void>;
  findOrCreateGoogleUser(
    googleId: string,
    userData: Partial<IUser>
  ): Promise<IUser>;
  findAdminByEmail(email: string): Promise<IUser | null>;
  findAllUsers(): Promise<IUser[]>;
  saveUser(user: IUser): Promise<IUser>;
  // Required method
  // updatePortfolio(
  //   userId: string,
  //   portfolioData: { stockId: string; quantity: number }
  // ): Promise<IUser | null>;
  getUserBalance(userId: string): Promise<number | null>;
  updateUserBalance(userId: string, amount: number): Promise<IUser | null>;
  updatePortfolioAfterSell(
    userId: string,
    stockId: string,
    quantityToSell: number
  ): Promise<IUser | null>;
  addSignupBonus(userId: string, type: string): Promise<IUser | null>;
  findByRefferalCode(refferalcode: string): Promise<IUser | null>;
  getPromotions(userId: string | undefined): Promise<IUser | null>;
  countUser(): Promise<number>;
}

export interface IWatchlistRepository {
  getByUserId(userId: string | undefined): Promise<any>;
  ensureWatchlistAndAddStock(
    userId: string | undefined,
    stockId: string
  ): Promise<IWatchlist>;
}

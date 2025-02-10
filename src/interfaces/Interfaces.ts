import mongoose, { Types, FilterQuery, UpdateQuery, Document } from "mongoose";
import { Request, Response } from "express";
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

type ObjectId = mongoose.Types.ObjectId;
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string | undefined;
  email: string | undefined;
  password?: string | undefined;
  createdAt: Date;
  is_Blocked: boolean;
  role: "user" | "admin";
  is_Admin: boolean;
  is_instructor: boolean;
  googleId?: string;
  profilePhoto?: string;
  portfolio: { stockId: IStock["_id"]; quantity: number }[];
  comparePassword(password: string): Promise<boolean>;
  balance: number;
  referralCode?: string;
  referredBy?: string;
  referralsCount: number;
  refreshToken: string;
  isEligibleForSignupBonus: boolean;
  isEligibleForReferralBonus: boolean;
  isEligibleForLoyaltyRewards: boolean;
  checkLoyaltyRewards(): Promise<void>;
}
export interface IWatchlist extends Document {
  user: IUser["_id"];
  stocks: { symbol: string; addedAt: Date }[];
  name: string;
  createdAt: Date;
}
export interface ITransaction extends Document {
  buyer: IUser["_id"];
  seller: IUser["_id"];
  buyOrder: IOrder["_id"] | IOrder;
  sellOrder: IOrder["_id"] | IOrder;
  stock: IStock["_id"] | IStock;
  type: "BUY" | "SELL";
  quantity: number;
  price: number;
  totalAmount: number;
  fees: number;
  status: "PENDING" | "COMPLETED" | "FAILED";
  paymentMethod?: "PAYPAL" | "CREDIT_CARD" | "BANK_TRANSFER";
  paymentReference?: string;
  createdAt: Date;
  completedAt?: Date;
}
export interface IStock extends Document {
  _id: Types.ObjectId;
  symbol: string;
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  price: number;
  change: number;
  changePercent: string;
  latestTradingDay: string;
  adjustedVolume: number;
}
export interface ISession extends Document {
  student_id: IUser["_id"] | null;
  instructor_name: string;
  instructorId: string;
  instructor_email: string;
  specialization: string;
  hourly_rate: number;
  start_time: Date;
  end_time: Date;
  status: "SCHEDULED" | "COMPLETED" | "CANCELED";
  created_at: Date;
  updated_at: Date;
  connection_status: "CONNECTED" | "DISCONNECTED" | "NOT CONNECTED";
}
export interface ISignupBonus {
  enabled: boolean;
  amount: number;
  minimumDepositRequired: number;
  expiryDays: number;
}

export interface IReferralBonus {
  enabled: boolean;
  referrerAmount: number;
  refereeAmount: number;
  maxReferralsPerUser: number;
  minimumDepositRequired: number;
}

export interface ILoyaltyRewards {
  enabled: boolean;
  tradingAmount: number;
  rewardAmount: number;
  timeframeInDays: number;
}

// Define the Promotion schema interface
export interface IPromotion extends Document {
  signupBonus: ISignupBonus;
  referralBonus: IReferralBonus;
  loyaltyRewards: ILoyaltyRewards;
}
export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  stock: IStock["_id"] | string | mongoose.Types.ObjectId;
  type: "BUY" | "SELL";
  orderType: "MARKET" | "LIMIT" | "STOP";
  quantity: number;
  price: number;
  stopPrice?: number;
  status: "PENDING" | "COMPLETED" | "FAILED";
  createdAt: Date;
  completedAt?: Date;
  isIntraday: Boolean;
  orderId?: string;
}
export interface ILimit extends Document {
  maxBuyLimit: number;
  maxSellLimit: number;
  timeframeInHours: number;
}
export interface ResponseModel<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}
export interface ILimitOrderQuery {
  orderType: string;
  status?: string | undefined;
  user?: { $regex: RegExp };
  createdAt?: { $gte: Date; $lte: Date };
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

export interface OtpStoreEntry {
  name?: string;
  email?: string;
  password?: string;
  otp?: string;
  role?: string;
  otpExpiration?: number;
  userId?: string;
  refferedBy?: string;
}

export interface IUserService {
  signup(
    name: string,
    email: string,
    password: string,
    role: string,
    referralCode?: string
  ): Promise<void>;
  verifyOtp(otp: string): Promise<{ token: string }>;
  resendOtp(email: string): Promise<string>;
  login(
    email: string,
    password: string
  ): Promise<{ token: string; refreshToken: string; user: IUser }>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(email: string, otp: string, newPassword: string): Promise<void>;
  home(): Promise<void>;
  getUserProfile(userId: string | undefined): Promise<IUser | null>;
  getUserPortfolio(userId: string | undefined): Promise<IUser | null>;
  getAllStocks(): Promise<IStock[]>;
  getStockById(userId: string | undefined): Promise<IStock | null>;
  placeOrder(
    user: ObjectId | undefined,
    stock: string,
    type: string,
    orderType: string,
    quantity: number,
    price: number,
    stopPrice: number,
    IsIntraday: Boolean | undefined
  ): Promise<IOrder | null>;
  getTransactions(userId: string | undefined): Promise<ITransaction[]>;
  updatePortfolioAfterSell(
    userId: string,
    stockId: string,
    quantityToSell: number
  ): Promise<IUser | null>;
  getMarketPrice(symbol: string): Promise<any>;
  getWatchlist(userId: string | undefined): Promise<any>;
  ensureWatchlistAndAddStock(
    userId: string | undefined,
    stocksymbol: string
  ): Promise<IWatchlist>;
  getStockData(symbol: string | undefined): Promise<any>;
  getReferralCode(userId: string | undefined): Promise<string | undefined>;
  getOrders(
    userId: string | undefined,
    skip: number,
    limit: number
  ): Promise<IOrder[] | null>;
  getUserProfileWithRewards(userId: string | undefined): Promise<IUser | null>;
  getTradeDiary(userId: string | undefined): Promise<any>;
  getActiveSessions(): Promise<ISession[] | null>;
  getAssignedSession(
    instructorId: string | undefined
  ): Promise<ISession[] | null>;
  getPurchased(userId: string | undefined): Promise<ISession[] | null>;
  getBySearch(query: Partial<IStock>): Promise<IStock[]>;
  getHistorical(symbol: string | undefined): Promise<any>;
  countOrders(userId: string | undefined): Promise<number>;
  refreshToken(refreshToken: string): Promise<string>;
  createVideoSession(instructorId: string): Promise<any>;
  joinSession(student: string, sessionId: string): Promise<any>;
}
export interface IAdminService {
  loginAdmin(email: string, password: string): Promise<{ token: string }>;
  getUserList(): Promise<IUser[]>;
  toggleUserBlockStatus(
    userId: string,
    token?: string
  ): Promise<{ message: string }>;
  getAllOrders(): Promise<IOrder[]>;
  getLimitOrders(query: ILimitOrderQuery): Promise<IOrder[]>;
  getMarketOrders(query: ILimitOrderQuery): Promise<IOrder[]>;
  getCompletedOrders(): Promise<IOrder[]>;
  getAllStocks(): Promise<IStock[]>;
  getAllTransactions(): Promise<ITransaction[]>;
  getUserPortfolio(userId: string): Promise<{
    user: {
      name: string | undefined;
      email: string | undefined;
      balance: number;
    };
    portfolio: {
      stock: IStock | null;
      quantity: number;
    }[];
  }>;
  getTotalFeesCollected(): Promise<number>;
  cancelOrder(orderId: string): Promise<IOrder | null>;
  updateLimit(limitData: ILimit): Promise<ILimit | null>;
  getLimits(): Promise<ILimit | null>;
  CreatePromotions(data: any): Promise<any>;
  createSsession(data: ISession): Promise<ISession | null>;
  getAllSessions(): Promise<ISession[] | null>;
  getSessionById(sessionId: string): Promise<ISession | null>;
  updateSessionData(
    sessionId: string,
    data: Partial<ISession>
  ): Promise<ISession | null>;
  cancelSession(
    sessionId: string,
    newStatus: "SCHEDULED" | "COMPLETED" | "CANCELED"
  ): Promise<ISession | null>;
  countUsers(): Promise<number>;
}

//Admin controller interface
export interface IAdminController {
  login(req: Request, res: Response): Promise<void>;
  getUserList(req: Request, res: Response): Promise<void>;
  disableUser(req: Request, res: Response): Promise<void>;
  getStockList(req: Request, res: Response): Promise<void>;
  getAllOrders(req: Request, res: Response): Promise<void>;
  getLimitOrders(req: Request, res: Response): Promise<void>;
  getMarketOrders(req: Request, res: Response): Promise<void>;
  getMatchedOrders(req: Request, res: Response): Promise<void>;
  getOrderDetails(req: Request, res: Response): Promise<void>;
  getAllTransactions(req: Request, res: Response): Promise<void>;
  getUserPortfolio(req: Request, res: Response): Promise<void>;
  getTotalFeesCollected(req: Request, res: Response): Promise<void>;
  cancelOrder(req: Request, res: Response): Promise<void>;
  updateLimit(req: Request, res: Response): Promise<void>;
  getLimits(req: Request, res: Response): Promise<void>;
  CreatePromotions(req: Request, res: Response): Promise<void>;
  createSession(req: Request, res: Response): Promise<void>;
  getAllSessions(req: Request, res: Response): Promise<void>;
  getSessionById(req: Request, res: Response): Promise<void>;
  updateSessionData(req: Request, res: Response): Promise<void>;
  cancelSession(req: Request, res: Response): Promise<void>;
}

export interface IUserController {
  signup(req: Request, res: Response): Promise<void>;
  verifyOtp(req: Request, res: Response): Promise<void>;
  resendOtp(req: Request, res: Response): Promise<void>;
  login(req: Request, res: Response): Promise<void>;
  forgotPassword(req: Request, res: Response): Promise<void>;
  resetPassword(req: Request, res: Response): Promise<void>;
  getStockList(req: Request, res: Response): Promise<void>;
  getUserProfile(req: Request, res: Response): Promise<void>;
  getUserportfolio(req: Request, res: Response): Promise<void>;
  placeOrder(req: Request, res: Response): Promise<void>;
  getWatchlist(req: Request, res: Response): Promise<void>;
  getTransaction(req: Request, res: Response): Promise<void>;
  updatePortfolioAfterSell(req: Request, res: Response): Promise<void>;
  ensureWatchlistAndAddStock(req: Request, res: Response): Promise<void>;
  getStockData(req: Request, res: Response): Promise<void>;
  getHistorical(req: Request, res: Response): Promise<void>;
  getReferralCode(req: Request, res: Response): Promise<void>;
  getOrders(req: Request, res: Response): Promise<void>;
  getPromotions(req: Request, res: Response): Promise<void>;
  getTradeDiary(req: Request, res: Response): Promise<void>;
  getActiveSessions(req: Request, res: Response): Promise<void>;
  getPurchased(req: Request, res: Response): Promise<void>;
  getAssigned(req: Request, res: Response): Promise<void>;
  getBySearch(req: Request, res: Response): Promise<void>;
  generate(req: Request, res: Response): Promise<void>;
  refreshToken(req: Request, res: Response): Promise<void>;
  createVideoSession(req: Request, res: Response): Promise<void>;
  getUploadURL(req: Request, res: Response): Promise<void>;
  getDownloadUrl(req: Request, res: Response): Promise<void>;
}

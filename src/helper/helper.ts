import { Request, Response } from "express";
import { ResponseModel } from "../interfaces/Interfaces";
import { HttpStatusCode } from "../interfaces/Interfaces";

const sendResponse = <T>(
  res: Response,
  statusCode: HttpStatusCode,
  success: boolean,
  message: string,
  data: T | null = null,
  error: Error | null = null
) => {
  res.status(statusCode).json({ success, message, data, error });
};



export default sendResponse;

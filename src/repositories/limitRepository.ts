import Limit from "../models/limitModel";
import { ILimit } from "../interfaces/modelInterface";

export interface ILimitRepository {
  updateLimit(limitData: Partial<ILimit>): Promise<ILimit | null>;
  getLimits(): Promise<ILimit | null>;
}
export class limitRepository {
  async updateLimit(limitData: Partial<ILimit>): Promise<ILimit | null> {
    try {
      const limit = await Limit.findOneAndUpdate({}, limitData, {
        new: true,
        upsert: true,
      }).exec();

      return limit;
    } catch (error: any) {
      throw new Error(`Failed to update limits: ${error.message}`);
    }
  }
  async getLimits(): Promise<ILimit | null> {
    const limit = await Limit.findOne();
    return limit;
  }
}

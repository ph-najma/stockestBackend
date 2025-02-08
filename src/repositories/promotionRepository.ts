import Promotion from "../models/promoModel";
import { IpromotionRepsoitory } from "../interfaces/Interfaces";
export class PromotionRepository implements IpromotionRepsoitory {
  async createPromotion(data: any): Promise<any> {
    const updatedPromotion = await Promotion.findOneAndUpdate(
      {},
      { $set: data },
      { new: true }
    );
    return updatedPromotion;
  }
  async findPromotion(): Promise<any> {
    return await Promotion.findOne();
  }
}

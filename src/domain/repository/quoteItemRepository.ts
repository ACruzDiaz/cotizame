import { QuoteItem } from "../quoteItem.js";

export interface QuoteItemRepository {
  save(entity: QuoteItem): Promise<QuoteItem>;
  update(id: string, entity: QuoteItem): Promise<QuoteItem>;
  findByID(id: string): Promise<QuoteItem | null>;
  findUniqueByClientPhoneGroupByStatusFilling(clientPhone: string): Promise<QuoteItem | null>;
  getAll(): Promise<QuoteItem[]>;
  updateMany(entities: QuoteItem[]): Promise<QuoteItem[]>;
  remove(id: string): Promise<void>;
}

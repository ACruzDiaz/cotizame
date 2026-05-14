import { QuoteItem } from "../quoteItem";

export interface QuoteItemRepository {
  save(entity: QuoteItem): Promise<QuoteItem>;
  update(id: string, entity: QuoteItem): Promise<QuoteItem>;
  findByID(id: string): Promise<QuoteItem | null>;
  getAll(): Promise<QuoteItem[]>;
  remove(id: string): Promise<void>;
}

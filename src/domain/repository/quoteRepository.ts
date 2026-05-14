import { Quote } from "../quote";

export interface QuoteRepository {
  save(entity: Quote): Promise<Quote>;
  update(id: string, entity: Quote): Promise<Quote>;
  findByID(id: string): Promise<Quote | null>;
  getAll(): Promise<Quote[]>;
  findLastPendingByClientId(userId:string): Promise<Quote | null>
  remove(id: string): Promise<void>;
}

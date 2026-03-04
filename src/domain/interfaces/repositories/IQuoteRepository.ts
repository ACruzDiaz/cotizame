import { Quote } from '../../entities/Quote';

export interface IQuoteRepository {
  create(quote: Quote): Promise<Quote>;
  findById(id: string): Promise<Quote | null>;
  findByCompanyId(companyId: string): Promise<Quote[]>;
  findByClientId(clientId: string): Promise<Quote[]>;
  update(quote: Quote): Promise<Quote>;
}

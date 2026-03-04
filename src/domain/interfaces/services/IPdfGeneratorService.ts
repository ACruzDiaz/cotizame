import { Quote } from '../../entities/Quote';
import { Company } from '../../entities/Company';
import { Client } from '../../entities/Client';

export interface IPdfGeneratorService {
  generateQuotePdf(quote: Quote, company: Company, client: Client): Promise<string>;
}

import { IQuoteRepository } from '../../../domain/interfaces/repositories/IQuoteRepository';
import { ICompanyRepository } from '../../../domain/interfaces/repositories/ICompanyRepository';
import { IClientRepository } from '../../../domain/interfaces/repositories/IClientRepository';
import { IPdfGeneratorService } from '../../../domain/interfaces/services/IPdfGeneratorService';

export interface GenerateQuotePdfInput {
  quoteId: string;
  companyId: string;
}

export class GenerateQuotePdf {
  constructor(
    private quoteRepository: IQuoteRepository,
    private companyRepository: ICompanyRepository,
    private clientRepository: IClientRepository,
    private pdfGeneratorService: IPdfGeneratorService,
  ) {}

  public async execute(input: GenerateQuotePdfInput): Promise<string> {
    const quote = await this.quoteRepository.findById(input.quoteId);
    if (!quote || quote.companyId !== input.companyId) {
      throw new Error('Quote not found');
    }

    const company = await this.companyRepository.findById(input.companyId);
    if (!company) {
      throw new Error('Company not found');
    }

    const client = await this.clientRepository.findById(quote.clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    return await this.pdfGeneratorService.generateQuotePdf(quote, company, client);
  }
}

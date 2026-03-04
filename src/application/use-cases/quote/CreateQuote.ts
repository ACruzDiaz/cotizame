import { IQuoteRepository } from '../../../domain/interfaces/repositories/IQuoteRepository';
import { IClientRepository } from '../../../domain/interfaces/repositories/IClientRepository';
import { IServiceRepository } from '../../../domain/interfaces/repositories/IServiceRepository';
import { Quote, QuoteStatus, QuoteItem } from '../../../domain/entities/Quote';
import { Client } from '../../../domain/entities/Client';

export interface CreateQuoteItemInput {
  serviceId: string;
  quantity: number;
}

export interface CreateQuoteInput {
  companyId: string;
  clientPhone: string;
  clientName?: string;
  items: CreateQuoteItemInput[];
  expiresAt: Date;
}

export class CreateQuote {
  constructor(
    private quoteRepository: IQuoteRepository,
    private clientRepository: IClientRepository,
    private serviceRepository: IServiceRepository,
  ) {}

  public async execute(input: CreateQuoteInput): Promise<Quote> {
    // 1. Find or create client
    let client = await this.clientRepository.findByPhone(input.companyId, input.clientPhone);
    if (!client) {
      client = Client.create({
        companyId: input.companyId,
        phone: input.clientPhone,
        name: input.clientName,
      });
      client = await this.clientRepository.create(client);
    }

    // 2. Fetch services and calculate totals
    const quoteItems: QuoteItem[] = [];
    let subtotal = 0;
    let totalTax = 0;

    for (const itemInput of input.items) {
      const service = await this.serviceRepository.findById(itemInput.serviceId);
      if (!service) {
        throw new Error(`Service not found: ${itemInput.serviceId}`);
      }

      if (service.companyId !== input.companyId) {
        throw new Error('Service does not belong to the company');
      }

      const unitPrice = service.basePrice;
      const itemTotal = unitPrice * itemInput.quantity;
      const itemTax = itemTotal * (service.taxRate / 100);

      const quoteItem = QuoteItem.create({
        serviceId: service.id!,
        quantity: itemInput.quantity,
        unitPrice: unitPrice,
        total: itemTotal,
      });

      quoteItems.push(quoteItem);
      subtotal += itemTotal;
      totalTax += itemTax;
    }

    // 3. Create quote
    const quote = Quote.create({
      companyId: input.companyId,
      clientId: client.id!,
      status: QuoteStatus.DRAFT,
      subtotal,
      tax: totalTax,
      total: subtotal + totalTax,
      expiresAt: input.expiresAt,
      items: quoteItems,
    });

    return await this.quoteRepository.create(quote);
  }
}

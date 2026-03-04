import { IQuoteRepository } from '../../../domain/interfaces/repositories/IQuoteRepository';
import { IClientRepository } from '../../../domain/interfaces/repositories/IClientRepository';
import { INotificationService } from '../../../domain/interfaces/services/INotificationService';
import { GenerateQuotePdf } from './GenerateQuotePdf';
import { QuoteStatus } from '../../../domain/entities/Quote';

export interface SendQuoteViaWhatsAppInput {
  quoteId: string;
  companyId: string;
}

export class SendQuoteViaWhatsApp {
  constructor(
    private quoteRepository: IQuoteRepository,
    private clientRepository: IClientRepository,
    private notificationService: INotificationService,
    private generateQuotePdf: GenerateQuotePdf,
  ) {}

  public async execute(input: SendQuoteViaWhatsAppInput): Promise<void> {
    const quote = await this.quoteRepository.findById(input.quoteId);
    if (!quote || quote.companyId !== input.companyId) {
      throw new Error('Quote not found');
    }

    const client = await this.clientRepository.findById(quote.clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    // 1. Generate PDF
    const pdfPath = await this.generateQuotePdf.execute({
      quoteId: input.quoteId,
      companyId: input.companyId,
    });

    // 2. Send Message
    const message = `Halo! Segue o link para aprovação do seu orçamento:\n\n*ID:* ${quote.id}\n*Valor:* ${quote.total}\n\nPor favor, revise o documento anexo.`;
    
    await this.notificationService.sendMessage(client.phone, message);
    await this.notificationService.sendDocument(client.phone, pdfPath, `Orcamento_${quote.id}.pdf`);

    // 3. Update Status
    if (quote.status === QuoteStatus.DRAFT) {
      (quote as any).props.status = QuoteStatus.SENT;
      await this.quoteRepository.update(quote);
    }
  }
}

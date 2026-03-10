"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendQuoteViaWhatsApp = void 0;
const Quote_1 = require("../../../domain/entities/Quote");
class SendQuoteViaWhatsApp {
    quoteRepository;
    clientRepository;
    notificationService;
    generateQuotePdf;
    constructor(quoteRepository, clientRepository, notificationService, generateQuotePdf) {
        this.quoteRepository = quoteRepository;
        this.clientRepository = clientRepository;
        this.notificationService = notificationService;
        this.generateQuotePdf = generateQuotePdf;
    }
    async execute(input) {
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
        if (quote.status === Quote_1.QuoteStatus.DRAFT) {
            quote.props.status = Quote_1.QuoteStatus.SENT;
            await this.quoteRepository.update(quote);
        }
    }
}
exports.SendQuoteViaWhatsApp = SendQuoteViaWhatsApp;

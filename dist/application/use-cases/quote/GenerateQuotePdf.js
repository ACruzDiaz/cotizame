"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateQuotePdf = void 0;
class GenerateQuotePdf {
    quoteRepository;
    companyRepository;
    clientRepository;
    pdfGeneratorService;
    constructor(quoteRepository, companyRepository, clientRepository, pdfGeneratorService) {
        this.quoteRepository = quoteRepository;
        this.companyRepository = companyRepository;
        this.clientRepository = clientRepository;
        this.pdfGeneratorService = pdfGeneratorService;
    }
    async execute(input) {
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
exports.GenerateQuotePdf = GenerateQuotePdf;

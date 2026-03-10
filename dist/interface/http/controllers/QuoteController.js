"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuoteController = void 0;
class QuoteController {
    createQuote;
    generateQuotePdf;
    sendQuoteViaWhatsApp;
    quoteRepository;
    constructor(createQuote, generateQuotePdf, sendQuoteViaWhatsApp, quoteRepository) {
        this.createQuote = createQuote;
        this.generateQuotePdf = generateQuotePdf;
        this.sendQuoteViaWhatsApp = sendQuoteViaWhatsApp;
        this.quoteRepository = quoteRepository;
    }
    createHandler = async (req, res, next) => {
        try {
            const result = await this.createQuote.execute({
                ...req.body,
                companyId: req.user.companyId,
            });
            res.status(201).json(result);
        }
        catch (error) {
            next(error);
        }
    };
    getAllHandler = async (req, res, next) => {
        try {
            const quotes = await this.quoteRepository.findByCompanyId(req.user.companyId);
            res.json(quotes);
        }
        catch (error) {
            next(error);
        }
    };
    getPdfHandler = async (req, res, next) => {
        try {
            const pdfPath = await this.generateQuotePdf.execute({
                quoteId: req.params.id,
                companyId: req.user.companyId,
            });
            res.download(pdfPath);
        }
        catch (error) {
            next(error);
        }
    };
    sendWhatsAppHandler = async (req, res, next) => {
        try {
            await this.sendQuoteViaWhatsApp.execute({
                quoteId: req.params.id,
                companyId: req.user.companyId,
            });
            res.status(200).json({ message: 'Quotation sent via WhatsApp' });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.QuoteController = QuoteController;

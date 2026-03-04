import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/AuthMiddleware';
import { CreateQuote } from '../../../application/use-cases/quote/CreateQuote';
import { GenerateQuotePdf } from '../../../application/use-cases/quote/GenerateQuotePdf';
import { SendQuoteViaWhatsApp } from '../../../application/use-cases/quote/SendQuoteViaWhatsApp';
import { IQuoteRepository } from '../../../domain/interfaces/repositories/IQuoteRepository';

export class QuoteController {
  constructor(
    private createQuote: CreateQuote,
    private generateQuotePdf: GenerateQuotePdf,
    private sendQuoteViaWhatsApp: SendQuoteViaWhatsApp,
    private quoteRepository: IQuoteRepository,
  ) {}

  public createHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.createQuote.execute({
        ...req.body,
        companyId: req.user!.companyId,
      });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  public getAllHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const quotes = await this.quoteRepository.findByCompanyId(req.user!.companyId);
      res.json(quotes);
    } catch (error) {
      next(error);
    }
  };

  public getPdfHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const pdfPath = await this.generateQuotePdf.execute({
        quoteId: req.params.id as string,
        companyId: req.user!.companyId,
      });
      res.download(pdfPath);
    } catch (error) {
      next(error);
    }
  };

  public sendWhatsAppHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await this.sendQuoteViaWhatsApp.execute({
        quoteId: req.params.id as string,
        companyId: req.user!.companyId,
      });
      res.status(200).json({ message: 'Quotation sent via WhatsApp' });
    } catch (error) {
      next(error);
    }
  };
}

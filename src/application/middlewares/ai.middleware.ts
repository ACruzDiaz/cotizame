import type { Request, Response, NextFunction } from "express";
import type { IArtificialInteligence } from "../../domain/ai/iAi";
import type { QuoteItemRepository } from "../../domain/repository/quoteItemRepository";

export function aiParsing(aiImpl:IArtificialInteligence, quoteItemRepository: QuoteItemRepository ){
  return async(
    req: Request,
    res: Response,
    next: NextFunction,
  ) =>{
    try {
      const quoteItem = await quoteItemRepository.findUniqueByClientPhoneGroupByStatusFilling(req.body.clientPhone) ?? undefined
      const result = await aiImpl.startAnalize(req.body.message, quoteItem?.parameters!)

      req.body.itemParameters = result.itemParameters;
      req.body.intention = result.intention;
      next();
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: "Error AI comunication",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }


}
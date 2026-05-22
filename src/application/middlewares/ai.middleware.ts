import type { Request, Response, NextFunction } from "express";
import type { IArtificialInteligence } from "../../domain/ai/iAi.js";
import logger from "../connection/logger.dev.js";

export function aiParsing(aiImpl:IArtificialInteligence){
  return async(
    req: Request,
    res: Response,
    next: NextFunction,
  ) =>{
    try {
      const result = await aiImpl.startAnalize(req.body.message)
      req.body.intention = result.intention;
      next();
    } catch (error: any) {
      logger.warn("Error in AI middleware " + error?.message)
      throw error
    }
  }


}
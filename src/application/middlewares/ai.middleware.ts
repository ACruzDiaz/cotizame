import type { Request, Response, NextFunction } from "express";
import type { IArtificialInteligence } from "../../domain/ai/iAi";

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
    } catch (error) {
      throw error
    }
  }


}
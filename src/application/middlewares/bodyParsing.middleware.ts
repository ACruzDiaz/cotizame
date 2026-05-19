import type { Request, Response, NextFunction } from "express";
import { ChatRequestDTO } from "../dtos/chat.requestDTO";

export function bodyParsing(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsedBody = ChatRequestDTO.body(req.body);
    req.body = parsedBody;
    next();
  } catch (error) {
    throw error
  }
}
import type { Request, Response, NextFunction } from "express";
import { ChatRequestDTO } from "../dtos/chat.requestDTO";

export function aiParsing(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {

    next();
  } catch (error) {
    res.status(400).json({
      message: "Error AI comunication",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
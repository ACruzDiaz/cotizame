import type { NextFunction, Request, Response } from "express";
import Redis from "ioredis";
import logger from "../connection/logger.dev.js";

export function redisProcessEvent(redis: Redis) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const eventId = req.body.clientPhone;

    if (!eventId) {
      logger.warn("Redis middleware did not receive a req.body.clientPhone");
      return;
    }
    const wasRegistered = await redis.set(
      `${eventId}`,
      "processed",
      "EX",
      60 * 5,
      "NX"
    );

    if (!wasRegistered) {
      logger.info("There is already an active proccess. Wait until it processing finish")
      return;
    }
    next();
  };
}

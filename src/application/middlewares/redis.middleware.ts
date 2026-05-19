import type { NextFunction, Request, Response } from "express";
import Redis from "ioredis";

export function redisProcessEvent(redis: Redis) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const eventId = req.body.clientPhone;

    if (!eventId) {
      console.log("No se recibio un mensaje valido . req.body.from");
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
      console.log("ya existe un proceso activo");
      return;
    }
    next();
  };
}

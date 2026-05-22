import fs from "fs";
import type { Request, Response, NextFunction } from "express";
import logger from "../connection/logger.dev.js";

export function whatsappWebHook(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let firstMessage:any = null;
  try {
    const body = req.body;
    res.status(200).send("OK");

    try {
      const logLine =
        JSON.stringify({
          receivedAt: new Date().toISOString(),
          payload: body,
        }) + "\n";
      fs.appendFile("webhooks.log", logLine, (err) => {
        if (err) logger.error("Error saving webhook payload:", err);
      });
    } catch (err) {
      throw new Error("Error writing webhook log:" + err);
    }

    if (body && body.object === "whatsapp_business_account") {
      (body.entry || []).forEach((entry: any) => {
        (entry.changes || []).forEach(async (change: any) => {
          const value = change.value;
          const messages = value?.messages;
          if (messages) {
            firstMessage = messages[0]
            for (const message of messages) {
              const from = message.from;
              const text = message.text?.body;
              const contacts = value?.contacts || [];
              const clientName = contacts[0]?.profile?.name;
              const companyPhone = value?.metadata?.display_phone_number;
              const timestamp = message.timestamp * 1000;
              if (Date.now() - message.timestamp*1000 > 60_000) {
                logger.info("Mensaje descartado por antigüedad");
                return
              }
              // Construir el body esperado por ChatManager
              req.body = {
                companyPhone: companyPhone,
                message: text,
                clientPhone: from,
                clientName: clientName,
                timestamp
              };
            }
          }
        });
      });
    }
    if(firstMessage?.id) next();
    return
  } catch (error) {
    throw error
  }
}

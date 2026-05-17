import fs from "fs";
import type { Request, Response, NextFunction } from "express";

export function whatsappWebHook(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = req.body;
    try {
      const logLine =
        JSON.stringify({
          receivedAt: new Date().toISOString(),
          payload: body,
        }) + "\n";
      fs.appendFile("webhooks.log", logLine, (err) => {
        if (err) console.error("Error saving webhook payload:", err);
      });
    } catch (err) {
      console.error("Error writing webhook log:", err);
    }

    if (body && body.object === "whatsapp_business_account") {
      (body.entry || []).forEach((entry: any) => {
        (entry.changes || []).forEach(async (change: any) => {
          const value = change.value;
          const messages = value?.messages;
          if (messages) {
            for (const message of messages) {
              const from = message.from;
              const text = message.text?.body;
              const contacts = value?.contacts || [];
              const clientName = contacts[0]?.profile?.name;
              const companyPhone = value?.metadata?.display_phone_number;


              // Construir el body esperado por ChatManager
              req.body = {
                companyPhone: companyPhone,
                message: text,
                clientPhone: from,
                clientName: clientName,
              };
              console.log(`Mensaje recibido de ${JSON.stringify(req.body)}`);
            }
          }
        });
      });
    }
    next();
  } catch (error) {
    console.error("Error procesando webhook de WhatsApp:", error);
  }
}

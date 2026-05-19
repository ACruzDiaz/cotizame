import fs from "fs";
import type { Request, Response, NextFunction } from "express";

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
            firstMessage = messages[0]
            for (const message of messages) {
              const from = message.from;
              const text = message.text?.body;
              const contacts = value?.contacts || [];
              const clientName = contacts[0]?.profile?.name;
              const companyPhone = value?.metadata?.display_phone_number;
              const timestamp = message.timestamp * 1000;
              if (Date.now() - message.timestamp*1000 > 60_000) {
                console.log("Evento descartado por antigüedad");
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
              // console.log(JSON.stringify(req.body));
            }
          }
        });
      });
    }
    console.log(firstMessage);
    if(firstMessage) next();
    return
  } catch (error) {
    console.error("Error procesando webhook de WhatsApp:");
    throw error
  }
}

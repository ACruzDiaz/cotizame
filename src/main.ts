import express from "express";
import Crypto from "crypto";
import ngrok from "@ngrok/ngrok";
import { ChatManager } from "./application/useCase/chatManager";
import { PrismaProductRepository } from "./infra/db/productRepository";
import { PrismaQuoteItemRepository } from "./infra/db/quoteItemRepository";
import { PrismaQuoteRepository } from "./infra/db/quoteRepository";
import { PrismaClientRepository } from "./infra/db/clientRepository";
import { PrismaCompanyRepository } from "./infra/db/companyRepository";
import { bodyParsing } from "./application/middlewares/bodyParsing.middleware";
import { aiParsing } from "./application/middlewares/ai.middleware";
import { GeminiServiceImpl } from "./infra/ai/gemini.ai";
import { urlencoded, json } from "express";
import type { IncomingMessage, ServerResponse } from "http";
import { whatsappWebHook } from "./application/middlewares/whatsapp.middleware";

const app = express();
const port = 8080;

app.use(urlencoded({ extended: true }));
app.use(json({ verify: verifyRequestSignature }));

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WEBHOOK_VERIFIED");
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403);
    }
  }

  return res.sendStatus(400);
});

app.post(
  "/webhook",
  whatsappWebHook,
  aiParsing(new GeminiServiceImpl()),
  bodyParsing,
  async (req, res) => {
    try {
      const message = await new ChatManager(
        new PrismaProductRepository(),
        new PrismaQuoteItemRepository(),
        new PrismaQuoteRepository(),
        new PrismaClientRepository(),
        new PrismaCompanyRepository(),
        new GeminiServiceImpl()
      ).start(req.body);
      //Enviar respuesta al cliente
      console.log(message);
    } catch (error) {
      console.log(error);
    }
  }
);

app.listen(port, () => {
  console.log("Node Server corriendo 🔥");
});

ngrok
  .connect({ addr: port, authtoken: process.env.NGROK_AUTHTOKEN! })
  .then((listener) => console.log(`Ingress established at: ${listener.url()}`));

function verifyRequestSignature(
  req: IncomingMessage,
  res: ServerResponse,
  buf: Buffer
) {
  const signature = req.headers["x-hub-signature-256"] as string | undefined;
  if (!signature) {
    console.warn(`Couldn't find "x-hub-signature-256" in headers.`);
  } else {
    const [algo, signatureHash] = signature.split("=");
    if (algo !== "sha256" || !signatureHash) {
      throw new Error("Invalid signature format");
    }
    let expectedHash = Crypto.createHmac(
      "sha256",
      process.env.APP_SECRET!
    )
      .update(buf)
      .digest("hex");
    if (signatureHash != expectedHash) {
      throw new Error("Couldn't validate the request signature.");
    }
  }
}

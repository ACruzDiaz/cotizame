import express from "express";
import Crypto from "crypto";
import ngrok from "@ngrok/ngrok";
import { ChatManager } from "./application/useCase/chatManager.js";
import { PrismaProductRepository } from "./infra/db/productRepository.js";
import { PrismaQuoteItemRepository } from "./infra/db/quoteItemRepository.js";
import { PrismaQuoteRepository } from "./infra/db/quoteRepository.js";
import { PrismaClientRepository } from "./infra/db/clientRepository.js";
import { PrismaCompanyRepository } from "./infra/db/companyRepository.js";
import { bodyParsing } from "./application/middlewares/bodyParsing.middleware.js";
import { aiParsing } from "./application/middlewares/ai.middleware.js";
import { GeminiServiceImpl } from "./infra/ai/gemini.ai.js";
import { urlencoded, json } from "express";
import type { IncomingMessage, ServerResponse } from "http";
import { whatsappWebHook } from "./application/middlewares/whatsapp.middleware.js";
import { redisProcessEvent } from "./application/middlewares/redis.middleware.js";
import Redis from "ioredis";
const token = process.env.ACCESS_TOKEN!;
const phoneNumberId =
  process.env.WHATSAPP_PHONE_NUMBER_ID!;

const version =
  process.env.WHATSAPP_API_VERSION ?? "v22.0";

type SendWhatsAppMessageParams = {
  to: string;
  message: string;
};


const app = express();
const port = 3000; //8080
const redis = new Redis(process.env.REDIS_URL!);

app.get("/",(req,res)=>{
  res.status(200).send("OK")
})

app.use(urlencoded({ extended: true }));
app.use(json({ verify: verifyRequestSignature }));


app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode && token) {
    if (token === VERIFY_TOKEN) {
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
  redisProcessEvent(redis),
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
      await sendWhatsAppMessage({to:req.body.clientPhone, message:message??'🧑‍💻🧑‍💻'})
    } catch (error) {
      console.log(error);
    }finally{
      await redis.del(req.body.clientPhone);

    }
  }
);

app.listen(port,"0.0.0.0", () => {
  console.log("Node Server corriendo 🔥");
});

// ngrok
//   .connect({ addr: "nginx:80", authtoken: process.env.NGROK_AUTHTOKEN! })
//   .then((listener) => console.log(`Ingress established at: ${listener.url()}`))
//   .catch(error => console.log('Ngrok Failed'))



async function sendWhatsAppMessage({
  to,
  message,
}: SendWhatsAppMessageParams) {
  const response = await fetch(
    `https://graph.facebook.com/${version}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: {
          body: message,
        },
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    console.error(data);

    throw new Error(
      "Failed to send WhatsApp message",
    );
  }

  return data;
}

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
    let expectedHash = Crypto.createHmac("sha256", process.env.APP_SECRET!)
      .update(buf)
      .digest("hex");
    if (signatureHash != expectedHash) {
      throw new Error("Couldn't validate the request signature.");
    }
  }
}

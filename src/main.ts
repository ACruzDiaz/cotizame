import express from "express";
import { GeminiServiceImpl } from "./infra/ai/gemini.service.impl";
import { QuoteService } from "./application/services/quote.service";
import { ClientService } from "./application/services/client.service";
import { CompanyService } from "./application/services/company.service";
import { QuoteItemService } from "./application/services/quoteItem.service";
import { ProductService } from "./application/services/product.service";
import { MessageHandler } from "./application/MessageHandler";
const app = express();
const port = 8080;

app.use(express.json())


app.get("/api/v1/", (req, res) => {
  res.send("Pagina de inicio \nIntenta con post.");
});

app.post("/api/v1", async (req, res) => {
  //TODO. Dar de alta una empresa con servicios. Crea una seed.
  try {
    await new MessageHandler(
      new GeminiServiceImpl(),
      new QuoteService(),
      new ClientService(),
      new CompanyService(),
      new QuoteItemService(),
      new ProductService()
    ).execute(req.body);
  } catch (error) {
    console.log(error);
    res.json({message: "Falla", error: error})
  }
});

app.listen(port, () => {
  console.log("Server corriendo 🔥");
});

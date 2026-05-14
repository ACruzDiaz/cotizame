import express from "express";
import { ChatManager } from "./application/useCase/chatManager";
import { PrismaProductRepository } from "./infra/db/productRepository";
import { PrismaQuoteItemRepository } from "./infra/db/quoteItemRepository";
import { PrismaQuoteRepository } from "./infra/db/quoteRepository";
import { PrismaUserRepository } from "./infra/db/userRepository";
import { PrismaCompanyRepository } from "./infra/db/companyRepository";
const app = express();

const port = 8080;

app.use(express.json());

app.get("/api/v1/", (req, res) => {
  res.send("Pagina de inicio \nIntenta con post.");
});

app.post("/api/v1", async (req, res) => {
  try {
    await new ChatManager(
      new PrismaProductRepository(),
      new PrismaQuoteItemRepository(),
      new PrismaQuoteRepository(),
      new PrismaUserRepository(),
      new PrismaCompanyRepository()
    ).start(req.body);
  } catch (error) {
    console.log(error);
    res.json({ message: "Error atrapado en proceso principal", error: error });
  }
});

app.listen(port, () => {
  console.log("Server corriendo 🔥");
});

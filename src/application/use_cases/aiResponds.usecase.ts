import type { Client, Prisma } from "../../generated/prisma/client";
import type { JsonObject } from "type-fest";
import type { AiService } from "../../infra/ai/ai.service";
import type { ProductService } from "../services/product.service";
import { QuoteService } from "../services/quote.service";
import type { QuoteItemService } from "../services/quoteItem.service";
import type { CompanyService } from "../services/company.service";
class AiRespondsUseCase {
  constructor(
    private aiService: AiService,
    private quoteService: QuoteService,
    private quoteItemService: QuoteItemService,
    private productService: ProductService,
    private companyService: CompanyService
  ) {}
  public async execute(client: Client) {
    //Necesitamos crear los servicios de la IA {parseo}
    //1. Recibimos instancia cliente. 👍🏻
    //2. Determinamos si tiene una Quote en proceso 👍🏻
    const pendingQuote = await this.quoteService.getByProperty({
      AND: {
        clientId: client.id,
        status: "pending",
      },
    });
    //3. De ser asi continuamos recabando los datos faltantes
    //3.5 Obtener el ultimo quote item agregado y revisar que tenga todos sus datos
    if (pendingQuote && pendingQuote.length > 0) {
      const lastQuoteItem = await this.quoteItemService.getLast(
        pendingQuote[0]?.id!
      );
      //...
      // const isQuoteItemComplete = lastQuoteItem.status == "complete";
      if (!lastQuoteItem) throw new Error("It does not exist any quote Item");
      if (lastQuoteItem && lastQuoteItem.status == "complete") {
        //Si los tiene todos los datos preguntar si agrega otro producto
        //...
      } else {
        //Si no los tiene pedir datos estructurados
        const productId = lastQuoteItem?.productId!; //jeje
        const product = await this.productService.getByProperty({
          id: productId,
        });
        if (product.length == 0) throw new Error("No products with this ID");
        const productParams = product[0]?.parameters!;
        const actualParams = lastQuoteItem.parameters;
        // if (
        //   typeof productParams == "string" ||
        //   typeof productParams == "number" ||
        //   typeof productParams == "boolean" ||
        //   Array.isArray(productParams)
        // ){
        //   throw new Error("Invalid Product params");
        // }

        await this.aiService.replyStructured(
          productParams as JsonObject,
          actualParams as JsonObject,
          "mensaje del cliente"
        );
      }
    }
    //4. De lo contrario saludamos y mostramos productos
    //4.5 No existe quote branch
    let clientResponse = await this.aiService.startConversation(
      "mensaje del cliente"
    );
    const productList = await this.productService.getAll(client.companyId);
    const parsedProductList = productList
      .map((t) => `- ${t.name}: ${t.description}.`)
      .join("\n");
    const companyData = await this.companyService.getById(client.companyId);
    if (!companyData) throw new Error("Error getting company by ID");
    clientResponse.concat(parsedProductList);
    if (companyData.website) {
      clientResponse.concat(`\n${companyData.website}`);
    }
    return clientResponse
    //5. La cuote se cierra cuando se envia una cotizacion o cuando el cliente pide cancelar
    //6. Se envia un mensaje de despedida y una invitacion para iniciar una nueva cotizacion

    //En este proceso no se necesita guardar mensajes. Quiza puede ser una funcion para el futuro,
    //donde el modelo necesita recordar historial de mensajes.
  }
}

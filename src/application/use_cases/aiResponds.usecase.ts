import {
  type QIStatus,
  type Client,
  type Prisma,
  type Quote,
  type QuoteItem,
  type QuoteStatus,
} from "../../generated/prisma/client";
import type { Flag } from "./state.types";
import type { AiService } from "../../infra/ai/ai.service";
import type { ProductService } from "../services/product.service";
import { QuoteService } from "../services/quote.service";
import type { QuoteItemService } from "../services/quoteItem.service";
import type { CompanyService } from "../services/company.service";
import { stateMachine } from "./stateMachine";
import { Intention } from "./state.types";
import { Formating } from "./Formating";

class AiRespondsUseCase {
  private quote: Quote | null = null;
  private quoteItem: QuoteItem | null = null;

  constructor(
    private aiService: AiService,
    private quoteService: QuoteService,
    private quoteItemService: QuoteItemService,
    private productService: ProductService,
    private companyService: CompanyService
  ) {}

  private async getCurrentState(
    clientId: string,
    command: Intention
  ): Promise<Flag> {
    //Obtener estado de la ultima orden
    let quoteStatus: QuoteStatus | null = null;
    let quoteItemStatus: QIStatus | null = null;
    this.quote = await this.quoteService.getLast(clientId);

    if (this.quote) {
      this.quoteItem = await this.quoteItemService.getLast(this.quote.id);
      quoteStatus = this.quote.status ? this.quote.status : null;
    }
    if (this.quoteItem && this.quoteItem.status) {
      quoteItemStatus = this.quoteItem.status ? this.quoteItem.status : null;
    }
    const currentState: Flag = await stateMachine(
      quoteStatus,
      quoteItemStatus,
      command
    );
    return currentState;
  }

  public async execute_2(client: Client, message: string): Promise<string> {
    const command = await this.aiService.getClientIntention(message);
    const state: Flag = await this.getCurrentState(client.id, command);

    switch (state) {
      case "FirstCreate":
        const productList = await this.productService.getAll(client.companyId);
        const company = await this.companyService.getById(client.companyId);
        const res = new Formating({
          productsList: productList,
          company: company,
        })
          .formatProductList()
          .formatCompany()
          .customMessage(
            `Si la cotización no va como esperabas puedes cancelar y empezar de nuevo.
            Si necesitas ayuda escribe asistencia y te daremos atención personalizada por via telefonica`
          )
          .build();

        return res; // Respuesta tipo string
      case "Cancel":
        await this.quoteService.updateStatus(this.quote?.clientId!, "closed"); //hehe
        return "Cotización cancelada.¿Por qué no intentamos de nuevo?";

      case "Complete":
        await this.quoteService.updateStatus(this.quote?.clientId!, "complete");
        //Aqui es donde se regresa el pdf
        const quotesItems = await this.quoteItemService.getByProperty({
          quoteId: this.quote?.id!,
        });
        return `Esta es tu cotización: ${quotesItems
          .map((t) => `- ${t.productId} + ${t.calculatedPrice}`)
          .join("\n")} Total: ${this.quote?.totalAmount}`;

      case "Create":
        const pList = await this.productService.getAll(client.companyId);
        const r = new Formating({
          productsList: pList,
          company: null,
        })
          .formatProductList()
          .customMessage(
            `Si la cotización no va como esperabas puedes cancelar y empezar de nuevo.
            Si necesitas ayuda escribe asistencia y te daremos atención personalizada por via telefonica`
          )
          .build();

        return r;

      case "Quoting":
        //Esta linea es suponiendo el usuario ya escogio el producto
        const paramsStructure = this.productService.getByProperty({})
        const clientQuoteItemParams = await this.aiService.replyStructured(

        )
        //Respuesta. Pedeir los datos que faltan
      break;
      case "Invalid":
        return "Lo siento no puedo ejecutar lo que me pides, intenta con x y o z"  
      break;
      default:
        throw new Error("AiRespondsUseCase Switch error")
    }
  }
}

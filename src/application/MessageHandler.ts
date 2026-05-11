import { QIStatus, QuoteStatus } from "../generated/prisma/enums";
import type { AiService } from "../infra/ai/ai.service";
import type { ClientService } from "./services/client.service";
import type { CompanyService } from "./services/company.service";
import type { QuoteService } from "./services/quote.service";
import type { QuoteItemService } from "./services/quoteItem.service";
import { QuoteContext } from "./use_cases/machine/contextMachine";
import { StateFactory } from "./use_cases/machine/StateFactory";
import type { IQuotingUseCases } from "./use_cases/machine/IQuotingUseCases";
import { ManageClientUseCase } from "./use_cases/ManageClient.usercase";
import { ManageQuoteUseCase } from "./use_cases/manageQuote.usecase";
import { ManageQuoteItemUseCase } from "./use_cases/manageQuoteItem.usecase";
import type { Product } from "../generated/prisma/client";
import type { JsonValue } from "@prisma/client/runtime/client";
import { Intention } from "./use_cases/state.types";
import type { ProductService } from "./services/product.service";
import { QuotingUseCases } from "./use_cases/machine/QuotingUseCases";
export class MessageHandler {
  constructor(
    private aiService: AiService,
    private quoteService: QuoteService,
    private clientService: ClientService,
    private companyService: CompanyService,
    private quoteItemService: QuoteItemService,
    private productService: ProductService,
  ) {}

  //Hoy.Agregamos estas 4 variables
  //Mañana. Hacer test de como MessageHandler.execute() reacciona a body
  async execute(body: unknown) {
    try {
      
    
    let productEntity: Product | undefined;
    let parameters: JsonValue | undefined;
    let responseMessage: string | undefined;
    let userIntention: Intention | undefined;

    if (typeof body === "object" && body !== null) {
      const test = body as { parameters?: JsonValue };
      parameters = test.parameters;
    }
    if (typeof body === "object" && body !== null) {
      const test = body as { userIntention?: Intention };
      userIntention = test.userIntention;
    }

    //Este metodo lo podemos mandar a un middleware
    const clientData = await new ManageClientUseCase(
      this.clientService,
      this.companyService
    ).execute(body);

    const quoteData = await new ManageQuoteUseCase(this.quoteService).execute(
      clientData.companyId,
      clientData.id
    );
    //Aqui nos quedamos
    //Deberia de hacer opcional el producto en base de datos?. Cuando se crea no hay nada despues de todo.
    const quoteItemData = await new ManageQuoteItemUseCase(
      this.quoteItemService
    ).execute(
      quoteData.id,
      {}, //Empty params
      QIStatus.Initializing
    );

    if (quoteItemData.productId) {
      let res = await this.productService.getByProperty({
        id: quoteItemData.productId,
      });
      productEntity = res.length > 0 ? res[0] : undefined;
    }

    const quoteContext = new QuoteContext(
      quoteData,
      quoteItemData,
      new QuotingUseCases(
        this.quoteService,
        this.quoteItemService,
        this.productService
      ),
      productEntity,
      parameters,
      responseMessage,
      userIntention
    );

    const state = StateFactory.create(quoteContext);
    state.activate();
    } catch (error) {
     console.log(error); 
    }
  }
}

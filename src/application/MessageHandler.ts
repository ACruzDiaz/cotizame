import { QIStatus, QuoteStatus } from "../generated/prisma/enums";
import type { AiService } from "../infra/ai/ai.service";
import type { ClientService } from "./services/client.service";
import type { CompanyService } from "./services/company.service";
import type { QuoteService } from "./services/quote.service";
import type { QuoteItemService } from "./services/quoteItem.service";
import { QuoteContext, StateFactory } from "./use_cases/machine/contextMachine";
import type { IQuotingUseCases } from "./use_cases/machine/IQuotingUseCases";
import { ManageClientUseCase } from "./use_cases/ManageClient.usercase";
import { ManageQuoteUseCase } from "./use_cases/manageQuote.usecase";
import { ManageQuoteItemUseCase } from "./use_cases/manageQuoteItem.usecase";
class MessageHandler {
  constructor(
    private aiService: AiService,
    private quoteService: QuoteService,
    private clientService: ClientService,
    private companyService: CompanyService,
    private quoteItemService: QuoteItemService,
    private quoteUseCases: IQuotingUseCases
  ) {}

  async execute(body: unknown) {
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
      {},//Empty params
      QIStatus.Initializing
    );
    const quoteContext = new QuoteContext(
      quoteData,
      quoteItemData,
      this.quoteUseCases
    );
    
    const state = new StateFactory(quoteContext);

  }
}

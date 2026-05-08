import { container } from "../../../../../vitest.setup";
import {
  expect,
  describe,
  it,
  test,
  vi,
  beforeEach,
  beforeAll,
  afterAll,
} from "vitest";
import { ClientService } from "../../../../../src/application/services/client.service";
import { CompanyService } from "../../../../../src/application/services/company.service";
import { ManageClientUseCase } from "../../../../../src/application/use_cases/ManageClient.usercase";
import { ManageQuoteUseCase } from "../../../../../src/application/use_cases/manageQuote.usecase";
import { QuoteService } from "../../../../../src/application/services/quote.service";
import { Decimal } from "@prisma/client/runtime/client";
//Pasar el formato de la tabla pnpm exec prisma migrate
describe("client use case", async () => {
  const clientService = new ClientService();
  const companyService = new CompanyService();
  const quoteService = new QuoteService();
  it("Validate ManageClientUseCase.execute() returns a client", async () => {
    const body = {
      clientPhone: "6666666",
      companyPhone: "5555555",
    };
    //Crear compañia ficticia para que funcine
    await companyService.create({
      name: "anyCompany",
      phoneNumber: "5555555",
    });

    const clientData = await new ManageClientUseCase(
      clientService,
      companyService
    ).execute(body);

    expect(clientData.clientPhone).toBe("6666666");
  });

  //Problabily its also good to create test for failure scenarios

  it("Validates ManageQuotetUseCase creates and return a Quote", async () => {
    const body = {
      clientPhone: "6666666",
      companyPhone: "5555555",
    };
    const company = await companyService.create({
      name: "anyCompany",
      phoneNumber: "5555555",
    });
    const client = await new ManageClientUseCase(
      clientService,
      companyService
    ).execute(body);
    
    const clientId = client.id;
    const companyId: string = company.id;

    const quote = await new ManageQuoteUseCase(quoteService).execute(
      companyId,
      clientId
    );

    expect(quote.totalAmount).toStrictEqual(Decimal(0));
    expect(quote.status).toBe("Pending");
  });

  it("ManageQuotetUseCase returns the last existing Quote" , async()=>{
    const body = {
      clientPhone: "6666666",
      companyPhone: "5555555",
    };
    const company = await companyService.create({
      name: "anyCompany",
      phoneNumber: "5555555",
    });
    const client = await new ManageClientUseCase(
      clientService,
      companyService
    ).execute(body);
    const existingQuote = await quoteService.create(
      {
        clientId:client.id,
        companyId: company.id,
        totalAmount: 0,
      }
    );

    const quoteRetrieved = await new ManageQuoteUseCase(quoteService).execute(
      company.id,
      client.id
    );
    expect(quoteRetrieved.id).toBe(existingQuote.id);



  })
  afterAll(async () => {
    container.stop();
  });
});

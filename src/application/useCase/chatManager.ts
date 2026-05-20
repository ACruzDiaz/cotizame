import type { CompanyRepository } from "../../domain/repository/companyRepository.js";
import type { ProductRepository } from "../../domain/repository/productRepository.js";
import type { QuoteItemRepository } from "../../domain/repository/quoteItemRepository.js";
import type { QuoteRepository } from "../../domain/repository/quoteRepository.js";
import type { ClientRepository } from "../../domain/repository/clientRepository.js";

import { Company } from "../../domain/company.js";
import { Product } from "../../domain/product.js";
import { Quote } from "../../domain/quote.js";
import { Client } from "../../domain/client.js";

import { Intention } from "../types/app.types.js";
import { QIStatus } from "../../generated/prisma/enums.js";
import { createSchema, type BodyReq } from "../dtos/chat.requestDTO.js";
import type { IArtificialInteligence } from "../../domain/ai/iAi.js";

export class ChatManager {
  constructor(
    private productRepository: ProductRepository,
    private quoteItemRepository: QuoteItemRepository,
    private quoteRepository: QuoteRepository,
    private clientRepository: ClientRepository,
    private companyRepository: CompanyRepository,
    private aiService: IArtificialInteligence
  ) {}
  public async start(parseBody: BodyReq) {
    let product: Product | null = null;
    let quote: Quote | null = null;

    //===== Carga de datos ===================================================
    const company: Company | null = await this.companyRepository.findByPhone(
      parseBody.companyPhone
    );
    if (!company)
      throw new Error("Error.No company registered with this phone number");

    //Logica de creacion de nuevo cliente
    let client: Client | null = await this.clientRepository.findByPhone(
      parseBody.clientPhone
    );
    if (!client){
      client = Client.create({
        clientPhone : parseBody.clientPhone,
        companyId : company.id,
      })
      await this.clientRepository.save(client)
    }
    quote = await this.quoteRepository.findLastPendingByClientId(client.id);
    //Logica de creacion de nueva quote
    if (!quote) {
      quote = Quote.create({ clientId: client.id, companyId: company.id });
      let newItem = quote.addItem({
        parameters: undefined,
        productId: undefined,
      });
      await this.quoteRepository.save(quote);
      await this.quoteItemRepository.save(newItem);
    }
    if (quote.items.length === 0) {
      let newItem = quote.addItem({
        parameters: undefined,
        productId: undefined,
      });
      await this.quoteItemRepository.save(newItem);
    }
    //======== Lógica de aplicación ===================================

    //Logica de cancelado de quote
    if (parseBody.intention === Intention.cancel) {
      if (quote) {
        quote.cancel();
        await this.quoteRepository.update(quote.id, quote);
        await this.quoteItemRepository.updateMany(quote.items);
      }
      return "We are sorry this went in the wrong direction. Why not you try again?";
    }

    //Logica de completado de quote
    if (parseBody.intention === Intention.complete) {
      if (quote) {
        quote.setPdfUrl('www.dominio.com/pdf/jsjs9ejejwi');
        quote.complete();
        await this.quoteRepository.update(quote.id, quote);
      }
      return `Quote completed. You can access to it in following link 👉🏻 ${quote.pdfUrl}`;
    }

    //======== Logica de estados =======================

    const actualQuoteItem = quote.findItem();
    if (actualQuoteItem === null) throw new Error("Error. No se encontro el QuoteItem actual");

    //Logica a ejecutar cuando estamos en estado Initializing
    if (actualQuoteItem.status === QIStatus.Initializing) {
      const prodList = await this.productRepository.getAllFilterByCompany(
        company.id
      );
      if (prodList.length === 0) {
        return `There are not available products for ${company.name}. Call us to give you support.`;
      }
      actualQuoteItem.startSelecting();
      await this.quoteRepository.update(quote.id, quote);
      await this.quoteItemRepository.update(actualQuoteItem.id, actualQuoteItem);
      const stringProdList = prodList.map((t) => `- ${t.name}: ${t.description}.`).join("\n");
      return `Welcome to ${company.name}. These are the products we have to offer you. Create a free quotation by selecting the product of your interest:\n
      ${stringProdList}\n If something goes wrong you can cancel anytime and start again.
      `;
    }

    //Logica a ejecutar cuando estamos en estado Selecting
    if (actualQuoteItem.status === QIStatus.Selecting) {
      const productsList = await this.productRepository.getAllFilterByCompanyPhone(company.phoneNumber)
      if (!productsList || productsList.length === 0) {
        return `This company does not have articles yet :(`;
      }
      const productSelected = await this.aiService.getInferProduct(parseBody.message, productsList)
      if (!productSelected) {
        return `I had a problem trying to understand that. What product did you mean?`;
      }
      actualQuoteItem.assignProduct(productSelected.id, productSelected.parameters);
      await this.quoteRepository.update(quote.id, quote);
      await this.quoteItemRepository.update(actualQuoteItem.id, actualQuoteItem);
      return `Product Selected!
      ${productSelected.name}: ${productSelected.description}.
      In order to provide you with an accurate quote, please supply the following details.
      ${JSON.stringify(productSelected.parameters)}
      `;
    }
    //Logica a ejecutar cuando estamos en estado Filling
    if (actualQuoteItem.status === QIStatus.Filling) {
      const product = await this.productRepository.findByID(actualQuoteItem.productId!)
      if (!product) throw new Error("Error. El producto seleccionado no existe en la base de datos");
      if (!actualQuoteItem.parameters) throw new Error("Error. No se encontro el quoteItem mas reciente");
      const itemParams = await this.aiService.getQuoteItemParams(parseBody.message, actualQuoteItem.parameters, product.parameters)
      
      if (itemParams === undefined) {
        const objKeys = Object.keys(actualQuoteItem.parameters);
        return `In order to provide you with an accurate quote, please supply the following 'null' details: 
        ${objKeys}`;
      }
      
      actualQuoteItem.addParams(itemParams, product);
      await this.quoteRepository.update(quote.id, quote);
      await this.quoteItemRepository.update(
        actualQuoteItem.id,
        actualQuoteItem
      );
      if (actualQuoteItem.isParamsCompleted) {
        return `You have completed this article. If you are finished and would like to know the total, simply type “complete.” Otherwise, we can continue with the next article.`;
      }
      return `In order to provide you with an accurate quote, please supply the following 'null' details: ${JSON.stringify(actualQuoteItem.parameters)}`;
    }

    //Logica a ejecutar cuando estamos en estado Done
    if (actualQuoteItem.status === QIStatus.Done) {
      const newItem = quote.addItem({
        parameters: undefined,
        productId: undefined,
      });
      await this.quoteItemRepository.save(newItem);
      return `You have completed this article. If you have finished and would like to know the total, simply type “complete.” Otherwise, we can continue with the next article.\nWhat do you want to do?`;
    }
  }
}

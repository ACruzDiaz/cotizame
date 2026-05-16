import type { CompanyRepository } from "../../domain/repository/companyRepository";
import type { ProductRepository } from "../../domain/repository/productRepository";
import type { QuoteItemRepository } from "../../domain/repository/quoteItemRepository";
import type { QuoteRepository } from "../../domain/repository/quoteRepository";
import type { ClientRepository } from "../../domain/repository/clientRepository";

import { Company } from "../../domain/company";
import { Product } from "../../domain/product";
import { Quote } from "../../domain/quote";
import { Client } from "../../domain/client";

import { ChatRequestDTO } from "../dtos/chat.requestDTO";
import { Intention } from "../types/app.types";
import { QIStatus } from "../../generated/prisma/enums";
import type{ BodyReq } from "../dtos/chat.requestDTO";
export class ChatManager {
  constructor(
    private productRepository: ProductRepository,
    private quoteItemRepository: QuoteItemRepository,
    private quoteRepository: QuoteRepository,
    private clientRepository: ClientRepository,
    private companyRepository: CompanyRepository
  ) {}
  public async start(parseBody: BodyReq) {
    let product: Product | null = null;
    let quote: Quote | null = null;

    //===== Carga de datos ===================================================
    const company: Company | null = await this.companyRepository.findByPhone(
      parseBody.companyPhone
    );
    if (!company)
      throw new Error("No company registered with this phone number");

    const client: Client | null = await this.clientRepository.findByPhone(
      parseBody.clientPhone
    );
    if (!client) throw new Error("No client registered with this phone number");

    if (parseBody.productId) {
      product = await this.productRepository.findByIDAndFilterByCompanyID(parseBody.productId, company.id);
      product === null ? undefined : product;
    }
    quote = await this.quoteRepository.findLastPendingByClientId(client.id);
    
    
    
    
    //======== Lógica de aplicación ====================================
    //Logica de creacion de nueva quote
    if (!quote) {
      quote = Quote.create({ clientId: client.id, companyId: company.id });
      let newItem = quote.addItem({parameters:undefined, productId:undefined})
      await this.quoteRepository.save(quote);
      await this.quoteItemRepository.save(newItem)
    }
    if(quote.items.length === 0){
      let newItem = quote.addItem({parameters:undefined, productId:undefined})
      await this.quoteItemRepository.save(newItem)
    }

    
    //Logica de cancelado de quote
    if (parseBody.intention === Intention.cancel) {
      if (quote) {
        quote.cancel();
        await this.quoteRepository.update(quote.id, quote);
        await this.quoteItemRepository.updateMany(quote.items);
      }
      return;
    }
    
    //Logica de completado de quote
    if (parseBody.intention === Intention.complete) {
      if (quote) {
        quote.complete();
        this.quoteRepository.update(quote.id, quote);
      }
      return;
    }
    
    //======== Logica de estados =======================

    const actualQuoteItem = quote.findItem()
    if(actualQuoteItem === null) throw new Error("Error en el sistema");
  
    //Logica a ejecutar cuando estamos en estado Initializing
    if (actualQuoteItem.status === QIStatus.Initializing) {
      let lastQuote = quote.findItem();
      let save = false;
      if (lastQuote === null) {
        lastQuote = quote.addItem({
          parameters: undefined,
          productId: undefined,
        });
        save = true;
      }
      console.log("Bienvido al negocio X. Intruciones...");
      console.log("Estos son nuestro productos:");
      const prodList = await this.productRepository.getAllFilterByCompany(
        company.id
      );
      console.log(prodList);
      lastQuote.startSelecting();
      await this.quoteRepository.update(quote.id, quote);
      if (save) {
        await this.quoteItemRepository.save(lastQuote);
      } else {
        await this.quoteItemRepository.update(lastQuote.id, lastQuote);
      }
      return
    }

    //Logica a ejecutar cuando estamos en estado Selecting
    if (actualQuoteItem.status === QIStatus.Selecting) {
      const lastItem = quote.findItem();
      if (lastItem === null) throw new Error("No existe");
      if (!product) {
        console.log("Selecciona un producto apá");
        return;
      }
      lastItem.assignProduct(product.id, product.parameters);
      await this.quoteItemRepository.update(lastItem.id, lastItem);

      console.log("Haz seleccionado el producto" + product.name);
      return
    }

    //TODO.Reolver bug. Tarda mas de un intento en marcar true y mark params complete
    //Logica a ejecutar cuando estamos en estado Filling
    if (actualQuoteItem.status === QIStatus.Filling) {

      const productId = actualQuoteItem.productId;
      if (!productId) throw new Error("Errrrorrrr");

      product = await this.productRepository.findByID(productId);
      const itemParams = parseBody.itemParameters;
      if (itemParams === undefined) {
        if (!actualQuoteItem.parameters) {
          console.log("error al intentar encontrar lastitem.parameters");
          return;
        }
        const objKeys = Object.keys(actualQuoteItem.parameters);
        console.log("Introduce un parametro valido: " + objKeys);
        return;
      }
      if (!product) throw new Error("El producto no fue asignado");

      actualQuoteItem.addParams(itemParams, product);
      await this.quoteRepository.update(quote.id, quote);
      await this.quoteItemRepository.update(actualQuoteItem.id, actualQuoteItem);
      return
    }

    //Logica a ejecutar cuando estamos en estado Done
    if (actualQuoteItem.status === QIStatus.Done) {
      const newItem = quote.addItem({
        parameters: undefined,
        productId: undefined,
      });
      await this.quoteItemRepository.save(newItem);
      return
    }

    /**
     * body{
     *  "clientPhone": "1111111",
        "companyPhone": "5555555",
        "productId" : "e0c669c6-0331-4f20-830a-ad36a65af1a0",
        "parameters" : {"urgency": null},
        "intention" : "cancel" | "completed" | "assitance"
     * }
     */
  }
}

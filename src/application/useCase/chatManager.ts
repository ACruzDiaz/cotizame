import type { CompanyRepository } from "../../domain/repository/companyRepository";
import type { ProductRepository } from "../../domain/repository/productRepository";
import type { QuoteItemRepository } from "../../domain/repository/quoteItemRepository";
import type { QuoteRepository } from "../../domain/repository/quoteRepository";
import type { ClientRepository } from "../../domain/repository/clientRepository";

import { Company } from "../../domain/company";
import { Product } from "../../domain/product";
import { Quote } from "../../domain/quote";
import { Client } from "../../domain/client";

import { Intention } from "../types/app.types";
import { QIStatus } from "../../generated/prisma/enums";
import type { BodyReq } from "../dtos/chat.requestDTO";
import type { IArtificialInteligence } from "../../domain/ai/iAi";

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
      return "Cotización cancelada";
    }

    //Logica de completado de quote
    if (parseBody.intention === Intention.complete) {
      if (quote) {
        quote.setPdfUrl('www.dominio.com/pdf/jsjs9ejejwi');
        quote.complete();
        await this.quoteRepository.update(quote.id, quote);
      }
      return `Cotización completada. Puedes verla en el siguiente enlace: ${quote.pdfUrl}`;
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
        return `No se encontraron productos para la empresa ${company.name}`;
      }
      actualQuoteItem.startSelecting();
      await this.quoteRepository.update(quote.id, quote);
      await this.quoteItemRepository.update(actualQuoteItem.id, actualQuoteItem);
      const stringProdList = prodList.map((t) => `- ${t.name}: ${t.description}.`).join("\n");
      return `Bienvenido a ${company.name}. Estos son lo productos que 
      tenemos para ofrecerte. Realiza una cotización totalmente gratis
      seleccionando el producto de tu interes:\n
      ${stringProdList}\n

      Cuando elijas tus podructo(s) solo escribe completar para hacerte llegar
      cotización. Puedes cancelar en cualquier momento.
      `;
    }

    //Logica a ejecutar cuando estamos en estado Selecting
    if (actualQuoteItem.status === QIStatus.Selecting) {
      const productsList = await this.productRepository.getAllFilterByCompanyPhone(company.phoneNumber)
      if (!productsList || productsList.length === 0) {
        return `Esta empresa no tiene productos registrados.`;
      }
      const productSelected = await this.aiService.getInferProduct(parseBody.message, productsList)
      if (!productSelected) {
        return `Error al inferir el producto.`;
      }
      actualQuoteItem.assignProduct(productSelected.id, productSelected.parameters);
      await this.quoteRepository.update(quote.id, quote);
      await this.quoteItemRepository.update(actualQuoteItem.id, actualQuoteItem);
      return `Producto Seleccionado! Elegiste : ${productSelected.name}.\n
      Detalles: ${productSelected.description}.\n
      A continuacion debes proporcionarme algunos detalles importantes:\n
      ${productSelected.parameters}
      `;
    }
    //Logica a ejecutar cuando estamos en estado Filling
    if (actualQuoteItem.status === QIStatus.Filling) {
      if (!actualQuoteItem.parameters) throw new Error("Error. No se encontro el quoteItem mas reciente");
      const itemParams = await this.aiService.getQuoteItemParams(parseBody.message, actualQuoteItem.parameters)
      
      if (itemParams === undefined) {
        const objKeys = Object.keys(actualQuoteItem.parameters);
        return `Parace ofrecerte una cotización certera necesito los siguiente datos: ${objKeys}`;
      }
      
      const product = await this.productRepository.findByID(actualQuoteItem.productId!)
      if (!product) throw new Error("Error. El producto seleccionado no existe en la base de datos");
      actualQuoteItem.addParams(itemParams, product);
      await this.quoteRepository.update(quote.id, quote);
      await this.quoteItemRepository.update(
        actualQuoteItem.id,
        actualQuoteItem
      );
      if (actualQuoteItem.isParamsCompleted) {
        return `Haz completado este articulo. Si has finalizado y quieres saber el
      total solamente escribe completar de lo contrario podemos continuar con el siguiente
      articulo.`;
      }
      return `Llevas estos datos: ${actualQuoteItem.parameters}`;
    }

    //Logica a ejecutar cuando estamos en estado Done
    if (actualQuoteItem.status === QIStatus.Done) {
      const newItem = quote.addItem({
        parameters: undefined,
        productId: undefined,
      });
      await this.quoteItemRepository.save(newItem);
      return `Haz completado este articulo. Si has finalizado y quieres saber el
      total solamente escribe completar de lo contrario podemos continuar con el siguiente
      articulo.`;
    }
  }
}

import type{ CompanyRepository } from "../../domain/repository/companyRepository";
import type { ProductRepository } from "../../domain/repository/productRepository";
import type { QuoteItemRepository } from "../../domain/repository/quoteItemRepository";
import type { QuoteRepository } from "../../domain/repository/quoteRepository";
import type { UserRepository } from "../../domain/repository/userRepository";

import { Company } from "../../domain/company";
import { Product } from "../../domain/product";
import { Quote } from "../../domain/quote";
import { QuoteItem } from "../../domain/quoteItem";
import { User } from "../../domain/user";

import { ChatRequestDTO } from "../dtos/chat.requestDTO";
import { Intention } from "../types/app.types";
export class ChatManager {
  constructor(
    private productRepository : ProductRepository,
    private quoteItemRepository : QuoteItemRepository,
    private quoteRepository : QuoteRepository,
    private userRepository : UserRepository,
    private companyRepository : CompanyRepository
  ){}
  public async start(body : unknown){

    const parseBody = ChatRequestDTO.body(body)

    if(parseBody.intention === Intention.cancel){
      //Logica de cancelado de quote
    }

    if(parseBody.intention === Intention.complete){
      //Logica de completado de quote
    }

    // const quote = await this.quoteRepository.findLastPendingByClientId(client.id)
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
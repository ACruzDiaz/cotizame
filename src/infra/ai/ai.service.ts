import type { JsonObject } from "type-fest";

export interface AiService {
  replyStructured(
    paramsStructure: JsonObject,
    actualParams: JsonObject,
    clientMessage: string,
    aditionalRules?: string[]
  ): Promise<JsonObject>;

  startConversation(clientMessage: string): Promise<string>;
}

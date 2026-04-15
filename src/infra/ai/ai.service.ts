import type { JsonObject } from "type-fest";
import type { Intention } from "../../application/use_cases/state.types";

export interface AiService {
  replyStructured(
    paramsStructure: JsonObject,
    actualParams: JsonObject,
    clientMessage: string,
    aditionalRules?: string[]
  ): Promise<JsonObject>;

  getClientIntention(clientMessage: string): Promise<Intention>;
}

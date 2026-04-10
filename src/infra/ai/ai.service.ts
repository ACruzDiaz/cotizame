export interface AiService {
  replyStructured(
    paramsStructure: Record<string, any>,
    actualParams: Object, //Este no me gusta pero ya tengo sueño
    clientMessage: string,
    aditionalRules?: String[]
  ): Promise<Record<string, unknown>>;
}

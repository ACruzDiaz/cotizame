import { qIParamsSchema, intentionSchema } from "./helpers/productParser";
import type { QuoteItemParams } from "../../domain/types/domain.types";
import type { IArtificialInteligence, MessageAnalisysAiType } from "../../domain/ai/iAi";
import { Intention } from "../../application/types/app.types";
import "dotenv/config";
import {
  GoogleGenAI,
} from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export class GeminiServiceImpl implements IArtificialInteligence {
  async startAnalize(
    message: string,
    quoteItemParams?: QuoteItemParams
  ): Promise<MessageAnalisysAiType> {
    let params: QuoteItemParams | undefined;
    if(quoteItemParams){
      params = await this.getQuoteItemParams(message, quoteItemParams);
    } 
    const intention = await this.getClientIntention(message);
    return {
      intention,
      itemParameters: params,
    };
  }

  private async getQuoteItemParams(
    message: string,
    quoteItemParams: QuoteItemParams | undefined
  ): Promise<QuoteItemParams | undefined> {
    const prompt = `
Estás en una conversación con un cliente. Su último mensaje fue: ${message}.
Estás realizando la cotización de un producto que el cliente pidió. 
Tu trabajo es identificar qué datos son nulos en la siguiente estructura: ${JSON.stringify(
      quoteItemParams
    )}
Y aquellos que sean null se reemplzaran por el valor que el cliente asigna en el emnsaje.

Reglas:
- Convierte las unidades a centimetros
- Solo utiliza la información explícita que el cliente proporcione en su mensaje.
- No inventes ni asumas valores que el cliente no haya mencionado.
- Si un campo no está presente en el mensaje del cliente, asigna exactamente null a ese campo.
- No reemplaces un material, medida o característica por otra similar: si no está en el mensaje, debe ser null.
- Devuelve únicamente los datos en el formato de la estructura indicada.`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: qIParamsSchema.toJSONSchema(),
      },
    });
    if (response.text === undefined) throw new Error("Valio verga gemini");
    console.log("Response qiparamsSchema: ");
    console.log(response.text);
    const res = qIParamsSchema.parse(JSON.parse(response.text));
    return res.itemParameters;
  }

  private async getClientIntention(
    clientMessage: string
  ): Promise<Intention | undefined> {
    const prompt = `
Estás en una conversación con un cliente. Su último mensaje fue: ${clientMessage}.
Estás realizando la cotización de un producto que el cliente pidió. 
Tu trabajo es identificar si en el actual mensaje la intención del usuario coincide con alguna de las siguientes
 ${JSON.stringify(Intention)}.

Reglas:
- Solo utiliza la información explícita que el cliente proporcione en su mensaje.
- No inventes ni asumas valores que el cliente no haya mencionado.
- Si ningun valor coincide asigna null.
- Devuelve únicamente los datos en el formato de la estructura indicada.
    `;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: intentionSchema.toJSONSchema(),
      },
    });
    if (response.text === undefined)
      throw new Error("El agente IA no pudo determinar la intención");
    // console.log("Response intention schema");
    // console.log(response.text);
    const res = intentionSchema.parse(JSON.parse(response.text))
    return res.intention
  }
}

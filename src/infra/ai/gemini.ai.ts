import { qIParamsSchema, intentionSchema } from "./helpers/productParser";
import type { AllowedQuoteItemParams, ProductParams, QuoteItemParams } from "../../domain/types/domain.types";
import type {
  IArtificialInteligence,
  MessageAnalisysAiType,
} from "../../domain/ai/iAi";
import { Intention } from "../../application/types/app.types";
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { Product } from "../../domain/product";
import { createSchema, parseParams } from "../../application/dtos/chat.requestDTO";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const modelName = "gemini-3.1-flash-lite";

export class GeminiServiceImpl implements IArtificialInteligence {
  async startAnalize(
    message: string,
  ): Promise<MessageAnalisysAiType> {
    const intention = await this.getClientIntention(message);

    return {
      intention,
    };
  }

  public async getInferProduct(
    message: string,
    productList: Product[]
  ): Promise<Product | undefined> {
    const productListString = JSON.stringify(
      productList.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
      }))
    );
    const prompt = `Estás en una conversación con un cliente. Su último mensaje fue: ${message}.
Estás realizando la cotización de un producto que el cliente pidió. 
Tu trabajo es identificar el id del producto al que el usuario hace referencia, la siguiente es la lista
de productos posibles: ${productListString}.
Reglas:
- Retorna el resultado con la siguiente estructura: { "productId": "<id>" }.
- Solo utiliza la información explícita que el cliente proporcione en su mensaje.
- No inventes ni asumas valores que el cliente no haya mencionado.
- Si no se puede relacionar el mensaje con ningun producto retorna la cadena de caracteres: "null".
`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });
    if (response.text === undefined) throw new Error("Valio verga gemini");
    if (response.text.includes("null")) {
      return undefined;
    }
    const json = JSON.parse(response.text);
    const product = productList.find((product) => product.id === json.productId);
    return product;
  }

  public async getQuoteItemParams(
    message: string,
    quoteItemParams: QuoteItemParams | undefined,
    productParameters: ProductParams
  ): Promise<QuoteItemParams> {
    const productParamsSchema = createSchema(productParameters)
    const prompt = `
Estás en una conversación con un cliente. Su último mensaje fue: ${message}.
Estás realizando la cotización de un producto que el cliente pidió. 
Tu trabajo es identificar qué datos son nulos en la siguiente estructura: ${JSON.stringify(
      quoteItemParams
    )}
Y aquellos que sean null se reemplzaran por el valor que el cliente asigna en el emnsaje.

Reglas:
- Solo utiliza la información explícita que el cliente proporcione en su mensaje.
- No inventes ni asumas valores que el cliente no haya mencionado.
- Si un campo no está presente en el mensaje del cliente, asigna exactamente null a ese campo.
- No reemplaces un material, medida o característica por otra similar: si no está en el mensaje, debe ser null.
- Devuelve únicamente los datos en el formato de la estructura indicada.`;
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: productParamsSchema.toJSONSchema(),
      },
    });
    if (response.text === undefined) throw new Error("Valio verga gemini");
    const res = parseParams(productParameters, JSON.parse(response.text));
    return res;
    // const res = qIParamsSchema.parse(JSON.parse(response.text));
    // return res.itemParameters;
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
- Marca como complete solo cuando este explicitamente escrito en el mensaje.
- No inventes ni asumas valores que el cliente no haya mencionado.
- Si ningun valor coincide asigna null.
- Devuelve únicamente los datos en el formato de la estructura indicada.
    `;
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: intentionSchema.toJSONSchema(),
      },
    });
    if (response.text === undefined)
      throw new Error("El agente IA no pudo determinar la intención");
    const res = intentionSchema.parse(JSON.parse(response.text));
    return res.intention;
  }
}

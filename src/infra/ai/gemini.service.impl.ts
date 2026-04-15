import { parametersToZod } from "./helpers/productParser";
import type { AiService } from "./ai.service";
import "dotenv/config";
import {
  GoogleGenAI,
  ThinkingLevel,
  GenerateContentResponse,
} from "@google/genai";
import type { JsonObject } from "type-fest";
import { Intention } from "../../application/use_cases/state.types";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

class GeminiServiceImpl implements AiService{
  constructor() {}

  public async replyStructured(
    paramsStructure: JsonObject,
    actualParams: JsonObject,
    clientMessage: string,
    aditionalRules?: String[]
  ){
    //Mejora. Inyectar este parser 
    const paramsSchema = parametersToZod(paramsStructure);
    // type TypeParams = z.infer<typeof paramsSchema>
    const prompt = `
Estás en una conversación con un cliente. Su último mensaje fue: ${clientMessage}.
Estás realizando la cotización de un producto que el cliente pidió. 
Tu trabajo es identificar qué datos faltan en la siguiente estructura: ${JSON.stringify(actualParams)}.

Reglas:
- Convierte las unidades a centimetros
- Solo utiliza la información explícita que el cliente proporcione en su mensaje.
- No inventes ni asumas valores que el cliente no haya mencionado.
- Si un campo no está presente en el mensaje del cliente, asigna exactamente null a ese campo.
- No reemplaces un material, medida o característica por otra similar: si no está en el mensaje, debe ser null.
- Devuelve únicamente los datos en el formato de la estructura indicada.
    ${aditionalRules && aditionalRules.map((rule) => `- ${rule}`).join('\n')}
    `;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: paramsSchema.toJSONSchema(),
      },
    });
    if (response.text === undefined) throw new Error("Valio verga gemini");
    const recipe = paramsSchema.parse(JSON.parse(response.text));
    const jsonObjectRecipe: JsonObject = JSON.parse(JSON.stringify(recipe))
    return jsonObjectRecipe;
  }
  
  public async getClientIntention(clientMessage:string):Promise<Intention>{
    return Intention.Assistance
  }
}

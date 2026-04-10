//Definimos esquemas zod
import { z } from "zod";

export function parametersToZod(parameters: Record<string, any>): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const [key, value] of Object.entries(parameters)) {
    if (Array.isArray(value)) {
      // Si es un array de strings → enum
      shape[key] = z.enum(value as [string, ...string[]]).nullable();
    } else if (value === "number") {
      shape[key] = z.number().nullable();
    } else if (value === "string") {
      shape[key] = z.string().nullable();
    } else if (value === "boolean") {
      shape[key] = z.boolean().nullable();
    }
  }

  return z.object(shape);
}

// const jsondata = 
// {
//   name:"string",
//   age:"number",
//   frutas:["manza", "fresa", "1"]
// }

// console.log(
//   parametersToZod(jsondata).toJSONSchema().properties
// );

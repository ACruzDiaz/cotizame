import type { DynamicPricingDsl } from "./dsl.types.js";
import { evaluatePricingDsl } from "./evaluator.js";

const basePrice = 100;

const dsl: DynamicPricingDsl = {
  rules: [
    {
      conditions: [{ field: "urgency", operator: "eq", value: true }],
      action: { operator: "multiply", value: 1.5 },
    },
    {
      conditions: [{ field: "m2", operator: "gt", value: 50 }],
      action: { operator: "add", value: 200 },
    },
  ],
};

const params1 = { urgency: true, m2: 40 }; // Should be 100 * 1.5 = 150
const params2 = { urgency: false, m2: 60 }; // Should be 100 + 200 = 300
const params3 = { urgency: true, m2: 60 }; // Should be (100 * 1.5) + 200 = 350
const params4 = {}; // Should be 100


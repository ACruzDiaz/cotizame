import { evaluatePricingDsl } from "./evaluator.js";
const basePrice = 100;
const dsl = {
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
console.log("Test 1 (urgency, no m2 > 50):", evaluatePricingDsl(basePrice, dsl, params1) === 150 ? "PASS" : "FAIL");
console.log("Test 2 (no urgency, m2 > 50):", evaluatePricingDsl(basePrice, dsl, params2) === 300 ? "PASS" : "FAIL");
console.log("Test 3 (urgency, m2 > 50):", evaluatePricingDsl(basePrice, dsl, params3) === 350 ? "PASS" : "FAIL");
console.log("Test 4 (no params):", evaluatePricingDsl(basePrice, dsl, params4) === 100 ? "PASS" : "FAIL");
//# sourceMappingURL=test.js.map
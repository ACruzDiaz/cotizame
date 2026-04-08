export function evaluatePricingDsl(basePrice, dsl, parameters) {
    let currentPrice = basePrice;
    if (!dsl || !dsl.rules || !Array.isArray(dsl.rules)) {
        return currentPrice;
    }
    for (const rule of dsl.rules) {
        if (shouldApplyRule(rule, parameters)) {
            currentPrice = applyAction(currentPrice, rule.action);
        }
    }
    // Optional: Prevent negative prices if that's a domain requirement
    return Math.max(0, currentPrice);
}
function shouldApplyRule(rule, parameters) {
    if (!rule.conditions)
        return true; // No conditions means always apply
    const conditions = Array.isArray(rule.conditions)
        ? rule.conditions
        : [rule.conditions];
    // ALL conditions must be met (AND evaluator)
    return conditions.every((condition) => evaluateCondition(condition, parameters));
}
function evaluateCondition(condition, parameters) {
    const paramValue = parameters[condition.field];
    const operator = condition.operator || "eq";
    // If the parameter wasn't provided, consider the condition failed
    // unless we explicitly check for 'neq' or something similar.
    if (paramValue === undefined && operator !== "neq") {
        return false;
    }
    switch (operator) {
        case "eq":
            return paramValue === condition.value;
        case "neq":
            return paramValue !== condition.value;
        case "gt":
            return Number(paramValue) > Number(condition.value);
        case "gte":
            return Number(paramValue) >= Number(condition.value);
        case "lt":
            return Number(paramValue) < Number(condition.value);
        case "lte":
            return Number(paramValue) <= Number(condition.value);
        case "contains":
            if (typeof paramValue === "string" || Array.isArray(paramValue)) {
                return paramValue.includes(condition.value);
            }
            return false;
        default:
            return false;
    }
}
function applyAction(price, action) {
    const { operator, value } = action;
    switch (operator) {
        case "add":
            return price + value;
        case "subtract":
            return price - value;
        case "multiply":
            return price * value;
        case "divide":
            return value !== 0 ? price / value : price; // prevent division by zero
        case "set":
            return value;
        default:
            return price;
    }
}
//# sourceMappingURL=evaluator.js.map
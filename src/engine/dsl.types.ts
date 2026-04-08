export type RuleConditionOperator =
  | "eq"
  | "neq"
  | "gt"
  | "lt"
  | "gte"
  | "lte"
  | "contains";

export interface RuleCondition {
  field: string;
  operator?: RuleConditionOperator; // Defaults to 'eq' if not provided
  value: any;
}

export type RuleActionOperator =
  | "add"
  | "subtract"
  | "multiply"
  | "divide"
  | "set";

export interface RuleAction {
  operator: RuleActionOperator;
  value: number;
}

export interface PricingRule {
  /**
   * One or more conditions that must all be true (AND logic).
   * If empty or undefined, the action always applies.
   */
  conditions?: RuleCondition | RuleCondition[];
  action: RuleAction;
}

export interface DynamicPricingDsl {
  rules: PricingRule[];
}

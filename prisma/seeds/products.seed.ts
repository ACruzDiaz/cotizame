import { prisma } from "../../src/application/connection/prismaClient";

const res = async() => await prisma.product.createMany({
  data: [
    {
      id: "e0c669c6-0331-4f20-830a-ad36a65af1a0",
      companyId: "295f5058-e9b1-436a-9a61-a36acc002914",
      name: "Product 1 from Company 1",
      parameters: {
        urgency: "boolean",
        m2: "number",
      },
      description: "This product is greate",
      notes: "What Should I write here?",
      basePrice: 12,
      dynamicPricingDsl: {
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
      },
    },
    {
      id: "066a9e4c-be78-4c59-8450-9648f52e9414",
      companyId: "295f5058-e9b1-431a-9a61-a36acc002914",
      name: "Product 1 from Company 2",
      parameters: {
        urgency: "boolean",
        m2: "number",
      },
      description: "This product is greate",
      notes: "What Should I write here?",
      basePrice: 79,
      dynamicPricingDsl: {
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
      },
    },
    {
      id: "1773e53e-cbad-4028-8054-985dd7dbf47d",
      companyId: "295f5058-e9b1-436a-9a61-a36acc002914",
      name: "Product 2 from Company 1",
      parameters: {
        urgency: "boolean",
        m2: "number",
      },
      description: "This product is greate",
      notes: "What Should I write here?",
      basePrice: 54,
      dynamicPricingDsl: {
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
      },
    },
  ],
});

export default res;
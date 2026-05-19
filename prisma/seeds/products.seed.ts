import { prisma } from "../../src/application/connection/prismaClient";

const res = async() => await prisma.product.createMany({
  data: [
    {
      id: "e0c669c6-0331-4f20-830a-ad36a65af1a0",
      companyId: "295f5058-e9b1-436a-9a61-a36acc002914",
      name: "Exterior wash detailing",
      parameters: {
        is_Urgent: "boolean",
        is_Small_Car: "boolean",
        include_Plastic_Shine:"boolean",
        include_Wax_Coat_protection: "boolean"

      },
      description: "Professional exterior detailing. Your car will be free of dust, mood and water spots",
      notes: "What Should I write here?",
      basePrice: 12,
      dynamicPricingDsl: {
        rules: [
          {
            conditions: [{ field: "is_Urgent", operator: "eq", value: true }],
            action: { operator: "multiply", value: 1.5 },
          },
          {
            conditions: [{ field: "is_Small_Car", operator: "eq", value: true }],
            action: { operator: "add", value: 0 },
          },
                    {
            conditions: [{ field: "include_Plastic_Shine", operator: "eq", value: true }],
            action: { operator: "add", value: 5 },
          },
                    {
            conditions: [{ field: "include_Wax_Coat_protection", operator: "eq", value: true }],
            action: { operator: "add", value: 5 },
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
      basePrice: 40,
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
      name: "Interior cleaning",
      parameters: {
        seats_number: "numeric",
        ozone_sanitization: "boolean",
        fragance:"boolean",
      },
      description: "Sanitizing, cleaning, vacum and whole removing of interior dirty",
      notes: "The are diferents kinds of fragances for you car, coconut, apple and chocolate.Ozone sanitization is a cleaning technic that can kill bacterias that cause bad smells",
      basePrice: 40,
      dynamicPricingDsl: {
        rules: [
          {
            conditions: [{ field: "seats_number", operator: "gt", value: 5 }],
            action: { operator: "multiply", value: 1.5 },
          },
          {
            conditions: [{ field: "ozone_sanitization", operator: "eq", value: true }],
            action: { operator: "add", value: 13 },
          },
          {
            conditions: [{ field: "fragance", operator: "eq", value: true }],
            action: { operator: "add", value: 3 },
          },
        ],
      },
    },
  ],
});

export default res;
import { describe, it, expect } from "vitest";
import { PdfService } from "../../src/infra/pdf/pdfService.js";
import { Company } from "../../src/domain/company.js";
import { Client } from "../../src/domain/client.js";
import { Quote } from "../../src/domain/quote.js";
import { PdfStorageService } from "../../src/infra/pdf/pdfStorageService.js";
import { Product } from "../../src/domain/product.js";
import fs from "fs";
import path from "path";
describe("PdfService Integration Test", () => {
  it("should generate a pdf document buffer", async () => {
    const pdfService = new PdfService();
    const pdfStorageService = new PdfStorageService();

    const pdfId = "test-pdf-123";
    const filePath = path.join(process.cwd(), `${pdfId}.pdf`);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    const product = Product.create({
      name: "Product 1",
      parameters: { test: "boolean", test2: "boolean", test3: "boolean" },
      basePrice: 10,
      companyId: "18dca623-e34c-49ca-aa6a-40e046bf3b0f",
      dynamicPricingDsl: {
        rules: [
          {
            conditions: [{ field: "test", operator: "eq", value: true }],
            action: { operator: "multiply", value: 1.5 },
          },
        ],
      },
      description: "Product 1 description",
      notes: "Product 1 notes",
      deletedAt: undefined,
    });
    const company = Company.create({
      name: "Acme Corp",
      phoneNumber: "1234567890",
      tier: "FREE" as any, // bypassing enum check
      website: "acme.com",
    });

    const client = Client.create({
      companyId: company.id,
      clientPhone: "0987654321",
      name: "John Doe",
    });

    const quote = Quote.create({
      companyId: company.id,
      clientId: client.id,
    });

    const quoteItem = quote.addItem({
      parameters: undefined,
      productId: undefined,
    });

    quoteItem.startSelecting();
    quoteItem.assignProduct("18dca623-e34c-49ca-aa6a-40e046bf3b0f", {
      test: "boolean",
      test2: "boolean",
      test3: "boolean",
    });
    quoteItem._markParamsCompleted();
    quoteItem._setPrice(10);

    const quoteItem2 = quote.addItem({
      parameters: undefined,
      productId: undefined,
    });

    quoteItem2.startSelecting();
    quoteItem2.assignProduct("18dca623-e34c-49ca-aa6a-40e046bf310f", {
      test: "boolean",
    });
    quoteItem2._markParamsCompleted();
    quoteItem2._setPrice(10);

    quote.complete();

    const pdfBuffer = await pdfService.generatePdf(
      pdfId,
      company,
      client,
      quote,
    );
    await pdfStorageService.save(pdfId, pdfBuffer, process.cwd());
    expect(pdfBuffer).toBeDefined();
    expect(pdfBuffer.byteLength ?? pdfBuffer.length).toBeGreaterThan(0);
  });
});

import { jsPDF } from "jspdf";
import type { IPdfService } from "../../domain/service/iPdfService.js";
import { Company } from "../../domain/company.js";
import { Client } from "../../domain/client.js";
import { Quote } from "../../domain/quote.js";
import logger from "../../application/connection/logger.dev.js";
export class PdfService implements IPdfService {
  public async generatePdf(
    pdfId: string,
    company: Company,
    client: Client,
    quote: Quote,
  ): Promise<any> {
    const doc = new jsPDF();
    doc.text(`Quote ID: ${pdfId}`, 10, 10);
    doc.text(`Company: ${company.name}`, 10, 20);
    doc.text(`Client Phone: ${client.clientPhone}`, 10, 30);

    let y = 40;
    doc.text(`Item Product ID`, 10, y);
    doc.text(`Parameters`, 80, y);
    doc.text(`Calculated Price`, 160, y);

    y += 10;
    for (const item of quote.items) {
      const productIdStr = `${item.productId ?? "N/A"}`;
      const productIdLines = doc.splitTextToSize(productIdStr, 60);

      const paramsStr =
        typeof item.parameters === "object"
          ? JSON.stringify(item.parameters)
          : `${item.parameters}`;
      const paramsLines = doc.splitTextToSize(paramsStr, 70);

      const priceStr = `${item.calculatedPrice ?? 0}`;

      doc.text(productIdLines, 10, y);
      doc.text(paramsLines, 80, y);
      doc.text(priceStr, 160, y);

      const maxLines = Math.max(productIdLines.length, paramsLines.length, 1);
      // Average line height is roughly 7 units in standard A4 jsPDF config.
      y += maxLines * 7 + 3;

      // Provide pagination logic slightly if y gets too close to bottom page
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    }
    doc.text(`Total Amount: ${quote.totalAmount}`, 10, y);

    return doc.output("arraybuffer"); //TODO: Change any to a PdfDocument type
  }
}

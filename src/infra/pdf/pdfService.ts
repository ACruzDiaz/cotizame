import { jsPDF } from "jspdf";
import type { IPdfService } from "../../domain/service/iPdfService.js";
import { Company } from "../../domain/company.js";
import { Client } from "../../domain/client.js";
import { QuoteItem } from "../../domain/quoteItem.js";

export class PdfService implements IPdfService {
  public async generatePdf(
    pdfId: string,
    company: Company,
    client: Client,
    items: QuoteItem[],
  ): Promise<any> {
    const doc = new jsPDF();
    doc.text(`Quote ID: ${pdfId}`, 10, 10);
    doc.text(`Company: ${company.name}`, 10, 20);
    doc.text(`Client Phone: ${client.clientPhone}`, 10, 30);

    let y = 40;
    for (const item of items) {
      doc.text(`Item Product ID: ${item.productId}`, 10, y);
      y += 10;
    }

    return doc.output("arraybuffer"); //TODO: Change any to a PdfDocument type
  }
}

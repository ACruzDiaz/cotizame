import { Company } from "../company.js";
import { Client } from "../client.js";
import { QuoteItem } from "../quoteItem.js";

export interface IPdfService {
  generatePdf(
    pdfId: string,
    company: Company,
    client: Client,
    items: QuoteItem[],
  ): Promise<any>; //TODO: Change any to a PdfDocument type
}

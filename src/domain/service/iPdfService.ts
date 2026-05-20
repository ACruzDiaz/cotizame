import { Company } from "../company.js";
import { Client } from "../client.js";
import { Quote } from "../quote.js";

export interface IPdfService {
  generatePdf(
    pdfId: string,
    company: Company,
    client: Client,
    quote: Quote,
  ): Promise<any>; //TODO: Change any to a PdfDocument type
}

import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { IPdfGeneratorService } from '../../domain/interfaces/services/IPdfGeneratorService';
import { Quote } from '../../domain/entities/Quote';
import { Company } from '../../domain/entities/Company';
import { Client } from '../../domain/entities/Client';

export class PuppeteerPdfGenerator implements IPdfGeneratorService {
  private readonly outputDir: string;

  constructor() {
    this.outputDir = process.env.PDF_TEMP_DIR || './tmp/pdfs';
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  public async generateQuotePdf(quote: Quote, company: Company, client: Client): Promise<string> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .company-info { font-size: 14px; }
            .quote-info { text-align: right; }
            .client-info { margin-top: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .totals { margin-top: 20px; text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-info">
              <h1>${company.name}</h1>
              <p>Phone: ${company.phone}</p>
            </div>
            <div class="quote-info">
              <h2>QUOTATION</h2>
              <p>Quote ID: ${quote.id}</p>
              <p>Date: ${quote.createdAt?.toLocaleDateString()}</p>
              <p>Expires: ${quote.expiresAt.toLocaleDateString()}</p>
            </div>
          </div>

          <div class="client-info">
            <h3>Bill To:</h3>
            <p>${client.name || 'Valued Client'}</p>
            <p>Phone: ${client.phone}</p>
            <p>Email: ${client.email || 'N/A'}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Service ID</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${quote.items
                .map(
                  (item) => `
                <tr>
                  <td>${item.serviceId}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.unitPrice.toFixed(2)}</td>
                  <td>$${item.total.toFixed(2)}</td>
                </tr>
              `,
                )
                .join('')}
            </tbody>
          </table>

          <div class="totals">
            <p>Subtotal: $${quote.subtotal.toFixed(2)}</p>
            <p>Tax: $${quote.tax.toFixed(2)}</p>
            <hr>
            <h3>Total: $${quote.total.toFixed(2)}</h3>
          </div>
        </body>
      </html>
    `;

    await page.setContent(htmlContent);
    const fileName = `quote_${quote.id}_${Date.now()}.pdf`;
    const filePath = path.join(this.outputDir, fileName);

    await page.pdf({ path: filePath, format: 'A4' });

    await browser.close();

    return filePath;
  }
}

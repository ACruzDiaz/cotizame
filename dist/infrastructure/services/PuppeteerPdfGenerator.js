"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PuppeteerPdfGenerator = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class PuppeteerPdfGenerator {
    outputDir;
    constructor() {
        this.outputDir = process.env.PDF_TEMP_DIR || './tmp/pdfs';
        if (!fs_1.default.existsSync(this.outputDir)) {
            fs_1.default.mkdirSync(this.outputDir, { recursive: true });
        }
    }
    async generateQuotePdf(quote, company, client) {
        const browser = await puppeteer_1.default.launch({ headless: true });
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
            .map((item) => `
                <tr>
                  <td>${item.serviceId}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.unitPrice.toFixed(2)}</td>
                  <td>$${item.total.toFixed(2)}</td>
                </tr>
              `)
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
        const filePath = path_1.default.join(this.outputDir, fileName);
        await page.pdf({ path: filePath, format: 'A4' });
        await browser.close();
        return filePath;
    }
}
exports.PuppeteerPdfGenerator = PuppeteerPdfGenerator;

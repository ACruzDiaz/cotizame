import type { IPdfStorage } from "../../domain/service/iPdfStorage.js";
import fs from "fs/promises";
import path from "path";

export class PdfStorageService implements IPdfStorage {
  public async save(pdfId: string, pdfContent: any, userDir?: string): Promise<void> {
    try {
      const dir = userDir ? userDir : "/pdfs";
      const filePath = path.join(dir, `${pdfId}.pdf`);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, Buffer.from(pdfContent));
    } catch (error) {
      throw error;
    }
  }
}

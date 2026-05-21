import type { IPdfStorage } from "../../domain/service/iPdfStorage.js";
import fs from "fs/promises";
import path from "path";
import logger from "../../application/connection/logger.dev.js";

export class PdfStorageService implements IPdfStorage {
  public async save(pdfId: string, pdfContent: any, userDir?: string): Promise<void> {
    try {
      const dir = userDir ? userDir : "/pdfs";
      const filePath = path.join(dir, `${pdfId}.pdf`);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, Buffer.from(pdfContent));
      logger.info(`PDF quote persisted on route: ${dir}`)
    } catch (error) {
      throw error;
    }
  }
}

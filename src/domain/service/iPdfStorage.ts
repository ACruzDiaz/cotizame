export interface IPdfStorage {
  save(pdfId: string, pdfContent: any): Promise<void>; //TODO: Change any to a PdfDocument type
}

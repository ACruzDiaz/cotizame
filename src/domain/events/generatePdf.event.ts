export class GeneratedPdfEvent {
  public readonly pdfId: string;
  public readonly pdfUrl: string;
  constructor(pdfId: string) {
    if (!pdfId || pdfId.trim() === "") throw new Error("Error. Invalid pdfId");
    this.pdfId = pdfId;
    this.pdfUrl = `https://localhost:80/quotes/${this.pdfId}.pdf`;
  }
}
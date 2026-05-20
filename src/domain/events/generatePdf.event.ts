export class GeneratedPdfEvent {
  public readonly pdfId: string;
  public readonly pdfUrl: string;
  constructor(pdfId: string) {
    if (!pdfId || pdfId.trim() === "") throw new Error("Error. Invalid pdfId");
    this.pdfId = pdfId;
    this.pdfUrl = `${process.env.BASE_URL_CUSTOMER}/pdfs/${this.pdfId}.pdf`;
  }
}

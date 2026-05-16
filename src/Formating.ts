import type { Client, Company, Product } from "./generated/prisma/client";

interface FormatEntity {
  productsList: Product[];
  company: Company | null;
}

export class Formating {
  private concatResult: string = "";

  private productsList: Product[];
  private company: Company | null;

  constructor(formatEntity: FormatEntity) {
    this.productsList = formatEntity.productsList;
    this.company = formatEntity.company;
  }

  public formatProductList(): this {
    const parsedProductList = this.productsList
      .map((t) => `- ${t.name}: ${t.description}.`)
      .join("\n");

    this.concatResult += parsedProductList;
    return this;
  }

  public formatCompany(): this {
    if (this.company?.website) {
      this.concatResult += `\n${this.company.website}`;
    }
    return this;
  }

  public customMessage(message:string): this {
    this.concatResult += message
    return this
  }

  public build(): string {
    return this.concatResult;
  }
}

import { Product } from "../product";

export interface ProductRepository {
  save(entity: Product): Promise<Product>;
  update(id: string, entity: Product): Promise<Product>;
  findByID(id: string): Promise<Product | null>;
  getAllFilterByCompany(companyId:string): Promise<Product[]>;
  findByIDAndFilterByCompanyID(productId:string, companyId:string): Promise<Product | null>;
  getAllFilterByCompanyPhone(companyPhone:string) : Promise<Product[]>;
}

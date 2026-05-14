import { Product } from "../product";

export interface ProductRepository {
  save(entity: Product): Promise<Product>;
  update(id: string, entity: Product): Promise<Product>;
  findByID(id: string): Promise<Product | null>;
  getAll(): Promise<Product[]>;
}

import { Company } from "../company";

export interface CompanyRepository {
  save(entity: Company): Promise<Company>;
  update(id: string, entity: Company): Promise<Company>;
  findByID(id: string): Promise<Company | null>;
  findByPhone(phone:string): Promise<Company | null>;
  getAll(): Promise<Company[]>;
  remove(id: string): Promise<void>;
}

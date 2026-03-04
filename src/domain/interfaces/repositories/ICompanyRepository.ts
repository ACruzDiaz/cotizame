import { Company } from '../../entities/Company';

export interface ICompanyRepository {
  create(company: Company): Promise<Company>;
  findById(id: string): Promise<Company | null>;
  findByPhone(phone: string): Promise<Company | null>;
  update(company: Company): Promise<Company>;
}

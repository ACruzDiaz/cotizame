import { Client } from '../../entities/Client';

export interface IClientRepository {
  create(client: Client): Promise<Client>;
  findById(id: string): Promise<Client | null>;
  findByPhone(companyId: string, phone: string): Promise<Client | null>;
  findByCompanyId(companyId: string): Promise<Client[]>;
  update(client: Client): Promise<Client>;
}

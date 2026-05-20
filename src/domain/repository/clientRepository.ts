import { Client } from "../client.js";

export interface ClientRepository {
  save(entity: Client): Promise<Client>;
  update(id: string, entity: Client): Promise<Client>;
  findByID(id: string): Promise<Client | null>;
  findByPhone(clientPhone: string): Promise<Client | null>;
  getAll(): Promise<Client[]>;
  remove(id: string): Promise<void>;
}

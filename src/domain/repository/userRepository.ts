import { User } from "../user.js";

export interface UserRepository {
  save(entity: User): Promise<User>;
  update(id: string, entity: User): Promise<User>;
  findByID(id: string): Promise<User | null>;
  getAll(): Promise<User[]>;
  remove(id: string): Promise<void>;
}

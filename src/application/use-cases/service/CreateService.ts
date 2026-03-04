import { IServiceRepository } from '../../../domain/interfaces/repositories/IServiceRepository';
import { Service } from '../../../domain/entities/Service';

export interface CreateServiceInput {
  companyId: string;
  name: string;
  description?: string;
  basePrice: number;
  taxRate: number;
}

export class CreateService {
  constructor(private serviceRepository: IServiceRepository) {}

  public async execute(input: CreateServiceInput): Promise<Service> {
    const service = Service.create({
      companyId: input.companyId,
      name: input.name,
      description: input.description,
      basePrice: input.basePrice,
      taxRate: input.taxRate,
    });

    return await this.serviceRepository.create(service);
  }
}

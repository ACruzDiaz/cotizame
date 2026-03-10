import { PrismaClient } from '@prisma/client';
import { IServiceRepository } from '../../domain/interfaces/repositories/IServiceRepository';
import { Service } from '../../domain/entities/Service';

export class PrismaServiceRepository implements IServiceRepository {
  constructor(private prisma: PrismaClient) {}

  public async create(service: Service): Promise<Service> {
    const created = await this.prisma.service.create({
      data: {
        id: service.id,
        companyId: service.companyId,
        name: service.name,
        description: service.description,
        basePrice: service.basePrice,
        taxRate: service.taxRate,
      },
    });

    return Service.create({
      ...created,
      basePrice: Number(created.basePrice),
      taxRate: Number(created.taxRate),
    } as any);
  }

  public async findById(id: string): Promise<Service | null> {
    const service = await this.prisma.service.findUnique({
      where: { id },
    });

    if (!service) return null;

    return Service.create({
      ...service,
      basePrice: Number(service.basePrice),
      taxRate: Number(service.taxRate),
    }as any);
  }

  public async findByCompanyId(companyId: string): Promise<Service[]> {
    const services = await this.prisma.service.findMany({
      where: { companyId },
    });

    return services.map((s: any) =>
      Service.create({
        ...s,
        basePrice: Number(s.basePrice),
        taxRate: Number(s.taxRate),
      }),
    );
  }

  public async update(service: Service): Promise<Service> {
    const updated = await this.prisma.service.update({
      where: { id: service.id },
      data: {
        name: service.name,
        description: service.description,
        basePrice: service.basePrice,
        taxRate: service.taxRate,
      },
    });

    return Service.create({
      ...updated,
      basePrice: Number(updated.basePrice),
      taxRate: Number(updated.taxRate),
    } as any);
  }

  public async delete(id: string): Promise<void> {
    await this.prisma.service.delete({
      where: { id },
    });
  }
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaServiceRepository = void 0;
const Service_1 = require("../../domain/entities/Service");
class PrismaServiceRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(service) {
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
        return Service_1.Service.create({
            ...created,
            basePrice: Number(created.basePrice),
            taxRate: Number(created.taxRate),
        });
    }
    async findById(id) {
        const service = await this.prisma.service.findUnique({
            where: { id },
        });
        if (!service)
            return null;
        return Service_1.Service.create({
            ...service,
            basePrice: Number(service.basePrice),
            taxRate: Number(service.taxRate),
        });
    }
    async findByCompanyId(companyId) {
        const services = await this.prisma.service.findMany({
            where: { companyId },
        });
        return services.map((s) => Service_1.Service.create({
            ...s,
            basePrice: Number(s.basePrice),
            taxRate: Number(s.taxRate),
        }));
    }
    async update(service) {
        const updated = await this.prisma.service.update({
            where: { id: service.id },
            data: {
                name: service.name,
                description: service.description,
                basePrice: service.basePrice,
                taxRate: service.taxRate,
            },
        });
        return Service_1.Service.create({
            ...updated,
            basePrice: Number(updated.basePrice),
            taxRate: Number(updated.taxRate),
        });
    }
    async delete(id) {
        await this.prisma.service.delete({
            where: { id },
        });
    }
}
exports.PrismaServiceRepository = PrismaServiceRepository;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaClientRepository = void 0;
const Client_1 = require("../../domain/entities/Client");
class PrismaClientRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(client) {
        const createdClient = await this.prisma.client.create({
            data: {
                id: client.id,
                companyId: client.companyId,
                name: client.name,
                phone: client.phone,
                email: client.email,
                userId: client.userId,
            },
        });
        return Client_1.Client.create(createdClient);
    }
    async findById(id) {
        const client = await this.prisma.client.findUnique({
            where: { id },
        });
        if (!client)
            return null;
        return Client_1.Client.create(client);
    }
    async findByPhone(companyId, phone) {
        const client = await this.prisma.client.findUnique({
            where: {
                companyId_phone: { companyId, phone },
            },
        });
        if (!client)
            return null;
        return Client_1.Client.create(client);
    }
    async findByCompanyId(companyId) {
        const clients = await this.prisma.client.findMany({
            where: { companyId },
        });
        return clients.map((c) => Client_1.Client.create(c));
    }
    async update(client) {
        const updatedClient = await this.prisma.client.update({
            where: { id: client.id },
            data: {
                name: client.name,
                phone: client.phone,
                email: client.email,
                userId: client.userId,
            },
        });
        return Client_1.Client.create(updatedClient);
    }
}
exports.PrismaClientRepository = PrismaClientRepository;

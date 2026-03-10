"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaCompanyRepository = void 0;
const Company_1 = require("../../domain/entities/Company");
class PrismaCompanyRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(company) {
        const createdCompany = await this.prisma.company.create({
            data: {
                id: company.id,
                name: company.name,
                phone: company.phone,
                plan: company.plan,
            },
        });
        return Company_1.Company.create({
            ...createdCompany,
            plan: createdCompany.plan,
        });
    }
    async findById(id) {
        const company = await this.prisma.company.findUnique({
            where: { id },
        });
        if (!company)
            return null;
        return Company_1.Company.create({
            ...company,
            plan: company.plan,
        });
    }
    async findByPhone(phone) {
        const company = await this.prisma.company.findUnique({
            where: { phone },
        });
        if (!company)
            return null;
        return Company_1.Company.create({
            ...company,
            plan: company.plan,
        });
    }
    async update(company) {
        const updatedCompany = await this.prisma.company.update({
            where: { id: company.id },
            data: {
                name: company.name,
                phone: company.phone,
                plan: company.plan,
            },
        });
        return Company_1.Company.create({
            ...updatedCompany,
            plan: updatedCompany.plan,
        });
    }
}
exports.PrismaCompanyRepository = PrismaCompanyRepository;

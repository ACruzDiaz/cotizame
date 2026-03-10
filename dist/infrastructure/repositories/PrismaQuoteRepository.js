"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaQuoteRepository = void 0;
const Quote_1 = require("../../domain/entities/Quote");
class PrismaQuoteRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(quote) {
        const created = await this.prisma.quote.create({
            data: {
                id: quote.id,
                companyId: quote.companyId,
                clientId: quote.clientId,
                status: quote.status,
                subtotal: quote.subtotal,
                tax: quote.tax,
                total: quote.total,
                expiresAt: quote.expiresAt,
                items: {
                    create: quote.items.map((item) => ({
                        serviceId: item.serviceId,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        total: item.total,
                    })),
                },
            },
            include: { items: true },
        });
        return this.mapToEntity(created);
    }
    async findById(id) {
        const quote = await this.prisma.quote.findUnique({
            where: { id },
            include: { items: true },
        });
        if (!quote)
            return null;
        return this.mapToEntity(quote);
    }
    async findByCompanyId(companyId) {
        const quotes = await this.prisma.quote.findMany({
            where: { companyId },
            include: { items: true },
        });
        return quotes.map((q) => this.mapToEntity(q));
    }
    async findByClientId(clientId) {
        const quotes = await this.prisma.quote.findMany({
            where: { clientId },
            include: { items: true },
        });
        return quotes.map((q) => this.mapToEntity(q));
    }
    async update(quote) {
        const updated = await this.prisma.quote.update({
            where: { id: quote.id },
            data: {
                status: quote.status,
                subtotal: quote.subtotal,
                tax: quote.tax,
                total: quote.total,
                expiresAt: quote.expiresAt,
            },
            include: { items: true },
        });
        return this.mapToEntity(updated);
    }
    mapToEntity(data) {
        return Quote_1.Quote.create({
            ...data,
            status: data.status,
            subtotal: Number(data.subtotal),
            tax: Number(data.tax),
            total: Number(data.total),
            items: data.items.map((item) => Quote_1.QuoteItem.create({
                ...item,
                unitPrice: Number(item.unitPrice),
                total: Number(item.total),
            })),
        });
    }
}
exports.PrismaQuoteRepository = PrismaQuoteRepository;

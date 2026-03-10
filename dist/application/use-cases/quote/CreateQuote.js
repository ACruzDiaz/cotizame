"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateQuote = void 0;
const Quote_1 = require("../../../domain/entities/Quote");
const Client_1 = require("../../../domain/entities/Client");
class CreateQuote {
    quoteRepository;
    clientRepository;
    serviceRepository;
    constructor(quoteRepository, clientRepository, serviceRepository) {
        this.quoteRepository = quoteRepository;
        this.clientRepository = clientRepository;
        this.serviceRepository = serviceRepository;
    }
    async execute(input) {
        // 1. Find or create client
        let client = await this.clientRepository.findByPhone(input.companyId, input.clientPhone);
        if (!client) {
            client = Client_1.Client.create({
                companyId: input.companyId,
                phone: input.clientPhone,
                name: input.clientName,
            });
            client = await this.clientRepository.create(client);
        }
        // 2. Fetch services and calculate totals
        const quoteItems = [];
        let subtotal = 0;
        let totalTax = 0;
        for (const itemInput of input.items) {
            const service = await this.serviceRepository.findById(itemInput.serviceId);
            if (!service) {
                throw new Error(`Service not found: ${itemInput.serviceId}`);
            }
            if (service.companyId !== input.companyId) {
                throw new Error('Service does not belong to the company');
            }
            const unitPrice = service.basePrice;
            const itemTotal = unitPrice * itemInput.quantity;
            const itemTax = itemTotal * (service.taxRate / 100);
            const quoteItem = Quote_1.QuoteItem.create({
                serviceId: service.id,
                quantity: itemInput.quantity,
                unitPrice: unitPrice,
                total: itemTotal,
            });
            quoteItems.push(quoteItem);
            subtotal += itemTotal;
            totalTax += itemTax;
        }
        // 3. Create quote
        const quote = Quote_1.Quote.create({
            companyId: input.companyId,
            clientId: client.id,
            status: Quote_1.QuoteStatus.DRAFT,
            subtotal,
            tax: totalTax,
            total: subtotal + totalTax,
            expiresAt: input.expiresAt,
            items: quoteItems,
        });
        return await this.quoteRepository.create(quote);
    }
}
exports.CreateQuote = CreateQuote;

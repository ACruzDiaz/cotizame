"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateService = void 0;
const Service_1 = require("../../../domain/entities/Service");
class CreateService {
    serviceRepository;
    constructor(serviceRepository) {
        this.serviceRepository = serviceRepository;
    }
    async execute(input) {
        const service = Service_1.Service.create({
            companyId: input.companyId,
            name: input.name,
            description: input.description,
            basePrice: input.basePrice,
            taxRate: input.taxRate,
        });
        return await this.serviceRepository.create(service);
    }
}
exports.CreateService = CreateService;

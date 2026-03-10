"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceController = void 0;
class ServiceController {
    createService;
    serviceRepository;
    constructor(createService, serviceRepository) {
        this.createService = createService;
        this.serviceRepository = serviceRepository;
    }
    createHandler = async (req, res, next) => {
        try {
            const result = await this.createService.execute({
                ...req.body,
                companyId: req.user.companyId,
            });
            res.status(201).json(result);
        }
        catch (error) {
            next(error);
        }
    };
    getAllHandler = async (req, res, next) => {
        try {
            const services = await this.serviceRepository.findByCompanyId(req.user.companyId);
            res.json(services);
        }
        catch (error) {
            next(error);
        }
    };
    updateHandler = async (req, res, next) => {
        try {
            const service = await this.serviceRepository.findById(req.params.id);
            if (!service || service.companyId !== req.user.companyId) {
                return res.status(404).json({ error: 'Service not found' });
            }
            const updated = await this.serviceRepository.update({
                ...service,
                ...req.body,
                id: service.id,
                companyId: service.companyId,
            });
            res.json(updated);
        }
        catch (error) {
            next(error);
        }
    };
    deleteHandler = async (req, res, next) => {
        try {
            const service = await this.serviceRepository.findById(req.params.id);
            if (!service || service.companyId !== req.user.companyId) {
                return res.status(404).json({ error: 'Service not found' });
            }
            await this.serviceRepository.delete(req.params.id);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    };
}
exports.ServiceController = ServiceController;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientController = void 0;
class ClientController {
    clientRepository;
    constructor(clientRepository) {
        this.clientRepository = clientRepository;
    }
    getAllHandler = async (req, res, next) => {
        try {
            const clients = await this.clientRepository.findByCompanyId(req.user.companyId);
            res.json(clients);
        }
        catch (error) {
            next(error);
        }
    };
    getOneHandler = async (req, res, next) => {
        try {
            const client = await this.clientRepository.findById(req.params.id);
            if (!client || client.companyId !== req.user.companyId) {
                return res.status(404).json({ error: 'Client not found' });
            }
            res.json(client);
        }
        catch (error) {
            next(error);
        }
    };
    updateHandler = async (req, res, next) => {
        try {
            const client = await this.clientRepository.findById(req.params.id);
            if (!client || client.companyId !== req.user.companyId) {
                return res.status(404).json({ error: 'Client not found' });
            }
            const updated = await this.clientRepository.update({
                ...client,
                ...req.body,
                id: client.id,
                companyId: client.companyId,
            });
            res.json(updated);
        }
        catch (error) {
            next(error);
        }
    };
}
exports.ClientController = ClientController;

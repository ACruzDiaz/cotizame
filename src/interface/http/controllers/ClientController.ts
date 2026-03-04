import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/AuthMiddleware';
import { IClientRepository } from '../../../domain/interfaces/repositories/IClientRepository';

export class ClientController {
  constructor(private clientRepository: IClientRepository) {}

  public getAllHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const clients = await this.clientRepository.findByCompanyId(req.user!.companyId);
      res.json(clients);
    } catch (error) {
      next(error);
    }
  };

  public getOneHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const client = await this.clientRepository.findById(req.params.id as string);
      if (!client || client.companyId !== req.user!.companyId) {
        return res.status(404).json({ error: 'Client not found' });
      }
      res.json(client);
    } catch (error) {
      next(error);
    }
  };

  public updateHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const client = await this.clientRepository.findById(req.params.id as string);
      if (!client || client.companyId !== req.user!.companyId) {
        return res.status(404).json({ error: 'Client not found' });
      }

      const updated = await this.clientRepository.update({
        ...client,
        ...req.body,
        id: client.id,
        companyId: client.companyId,
      });

      res.json(updated);
    } catch (error) {
      next(error);
    }
  };
}

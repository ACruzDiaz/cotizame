import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/AuthMiddleware';
import { CreateService } from '../../../application/use-cases/service/CreateService';
import { IServiceRepository } from '../../../domain/interfaces/repositories/IServiceRepository';

export class ServiceController {
  constructor(
    private createService: CreateService,
    private serviceRepository: IServiceRepository,
  ) {}

  public createHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.createService.execute({
        ...req.body,
        companyId: req.user!.companyId,
      });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  public getAllHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const services = await this.serviceRepository.findByCompanyId(req.user!.companyId);
      res.json(services);
    } catch (error) {
      next(error);
    }
  };

  public updateHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const service = await this.serviceRepository.findById(req.params.id as string);
      if (!service || service.companyId !== req.user!.companyId) {
        return res.status(404).json({ error: 'Service not found' });
      }

      const updated = await this.serviceRepository.update({
        ...service,
        ...req.body,
        id: service.id,
        companyId: service.companyId,
      });

      res.json(updated);
    } catch (error) {
      next(error);
    }
  };

  public deleteHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const service = await this.serviceRepository.findById(req.params.id as string);
      if (!service || service.companyId !== req.user!.companyId) {
        return res.status(404).json({ error: 'Service not found' });
      }

      await this.serviceRepository.delete(req.params.id as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

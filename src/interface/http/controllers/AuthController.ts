import { Request, Response, NextFunction } from 'express';
import { RegisterCompany } from '../../../application/use-cases/auth/RegisterCompany';
import { LoginUser } from '../../../application/use-cases/auth/LoginUser';
import { RefreshTokenUseCase } from '../../../application/use-cases/auth/RefreshTokenUseCase';
import { RegisterClientUser } from '../../../application/use-cases/auth/RegisterClientUser';
import { ICompanyRepository } from '../../../domain/interfaces/repositories/ICompanyRepository';

export class AuthController {
  constructor(
    private registerCompany: RegisterCompany,
    private loginUser: LoginUser,
    private refreshTokenUseCase: RefreshTokenUseCase,
    private registerClientUser: RegisterClientUser,
    private companyRepository: ICompanyRepository,
  ) {}

  public registerCompanyHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.registerCompany.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  public loginHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.loginUser.execute(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public refreshHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.refreshTokenUseCase.execute(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public registerClientHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Find companyId from phone in metadata (Simulated by req.body.companyPhone or similar for now)
      // As per instructions: "The endpoint will receive the phone number's company in the metadata"
      const { phone, email, password, companyPhone } = req.body;
      
      const company = await this.companyRepository.findByPhone(companyPhone);
      if (!company) {
        return res.status(404).json({ error: 'Company not found for this phone metadata' });
      }

      await this.registerClientUser.execute({
        companyId: company.id!,
        phone,
        email,
        password
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

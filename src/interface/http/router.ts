import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

// Repositories
import { PrismaUserRepository } from '../../infrastructure/repositories/PrismaUserRepository';
import { Role } from '../../domain/entities/User';
import { PrismaCompanyRepository } from '../../infrastructure/repositories/PrismaCompanyRepository';
import { PrismaClientRepository } from '../../infrastructure/repositories/PrismaClientRepository';
import { PrismaRefreshTokenRepository } from '../../infrastructure/repositories/PrismaRefreshTokenRepository';
import { PrismaQuoteRepository } from '../../infrastructure/repositories/PrismaQuoteRepository';
import { PrismaServiceRepository } from '../../infrastructure/repositories/PrismaServiceRepository';

// Services
import { BcryptPasswordHasher } from '../../infrastructure/security/BcryptPasswordHasher';
import { JwtService } from '../../infrastructure/security/JwtService';
import { EvolutionApiWhatsAppAdapter } from '../../infrastructure/services/EvolutionApiWhatsAppAdapter';
import { PuppeteerPdfGenerator } from '../../infrastructure/services/PuppeteerPdfGenerator';

// Use Cases
import { RegisterCompany } from '../../application/use-cases/auth/RegisterCompany';
import { LoginUser } from '../../application/use-cases/auth/LoginUser';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/RefreshTokenUseCase';
import { RegisterClientUser } from '../../application/use-cases/auth/RegisterClientUser';
import { CreateQuote } from '../../application/use-cases/quote/CreateQuote';
import { GenerateQuotePdf } from '../../application/use-cases/quote/GenerateQuotePdf';
import { SendQuoteViaWhatsApp } from '../../application/use-cases/quote/SendQuoteViaWhatsApp';
import { CreateService } from '../../application/use-cases/service/CreateService';

// Controllers
import { AuthController } from './controllers/AuthController';
import { QuoteController } from './controllers/QuoteController';
import { ServiceController } from './controllers/ServiceController';
import { ClientController } from './controllers/ClientController';

// Middlewares
import { AuthMiddleware } from './middlewares/AuthMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Dependency Injection Factory (Simulated)
const userRepo = new PrismaUserRepository(prisma);
const companyRepo = new PrismaCompanyRepository(prisma);
const clientRepo = new PrismaClientRepository(prisma);
const refreshRepo = new PrismaRefreshTokenRepository(prisma);
const quoteRepo = new PrismaQuoteRepository(prisma);
const serviceRepo = new PrismaServiceRepository(prisma);

const hasher = new BcryptPasswordHasher();
const jwtSvc = new JwtService();
const notifySvc = new EvolutionApiWhatsAppAdapter();
const pdfSvc = new PuppeteerPdfGenerator();

const authMiddleware = new AuthMiddleware(jwtSvc);

// Use Cases Injection
const regCompanyUC = new RegisterCompany(companyRepo, userRepo, hasher);
const loginUC = new LoginUser(userRepo, refreshRepo, hasher, jwtSvc);
const refreshUC = new RefreshTokenUseCase(refreshRepo, jwtSvc);
const regClientUC = new RegisterClientUser(clientRepo, userRepo, hasher);
const createQuoteUC = new CreateQuote(quoteRepo, clientRepo, serviceRepo);
const genPdfUC = new GenerateQuotePdf(quoteRepo, companyRepo, clientRepo, pdfSvc);
const sendWaUC = new SendQuoteViaWhatsApp(quoteRepo, clientRepo, notifySvc, genPdfUC);
const createServiceUC = new CreateService(serviceRepo);

// Controllers Injection
const authCtrl = new AuthController(regCompanyUC, loginUC, refreshUC, regClientUC, companyRepo);
const quoteCtrl = new QuoteController(createQuoteUC, genPdfUC, sendWaUC, quoteRepo);
const serviceCtrl = new ServiceController(createServiceUC, serviceRepo);
const clientCtrl = new ClientController(clientRepo);

// --- ROUTES ---

// Auth
router.post('/auth/register-company', authCtrl.registerCompanyHandler);
router.post('/auth/login', authCtrl.loginHandler);
router.post('/auth/refresh', authCtrl.refreshHandler);
router.post('/auth/register-client', authCtrl.registerClientHandler);

// Quotes (Protected)
router.post('/quotes', authMiddleware.handle, quoteCtrl.createHandler);
router.get('/quotes', authMiddleware.handle, quoteCtrl.getAllHandler);
router.get('/quotes/:id/pdf', authMiddleware.handle, quoteCtrl.getPdfHandler);
router.post('/quotes/:id/send-whatsapp', authMiddleware.handle, quoteCtrl.sendWhatsAppHandler);

// Services (Protected)
router.post('/services', authMiddleware.handle, serviceCtrl.createHandler);
router.get('/services', authMiddleware.handle, serviceCtrl.getAllHandler);
router.patch('/services/:id', authMiddleware.handle, serviceCtrl.updateHandler);
router.delete('/services/:id', authMiddleware.handle, authMiddleware.roleRequired([Role.ADMIN]), serviceCtrl.deleteHandler);

// Clients (Protected)
router.get('/clients', authMiddleware.handle, clientCtrl.getAllHandler);
router.get('/clients/:id', authMiddleware.handle, clientCtrl.getOneHandler);
router.patch('/clients/:id', authMiddleware.handle, clientCtrl.updateHandler);

export { router };

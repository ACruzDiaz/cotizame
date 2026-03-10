"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
// Repositories
const PrismaUserRepository_1 = require("../../infrastructure/repositories/PrismaUserRepository");
const User_1 = require("../../domain/entities/User");
const PrismaCompanyRepository_1 = require("../../infrastructure/repositories/PrismaCompanyRepository");
const PrismaClientRepository_1 = require("../../infrastructure/repositories/PrismaClientRepository");
const PrismaRefreshTokenRepository_1 = require("../../infrastructure/repositories/PrismaRefreshTokenRepository");
const PrismaQuoteRepository_1 = require("../../infrastructure/repositories/PrismaQuoteRepository");
const PrismaServiceRepository_1 = require("../../infrastructure/repositories/PrismaServiceRepository");
// Services
const BcryptPasswordHasher_1 = require("../../infrastructure/security/BcryptPasswordHasher");
const JwtService_1 = require("../../infrastructure/security/JwtService");
const EvolutionApiWhatsAppAdapter_1 = require("../../infrastructure/services/EvolutionApiWhatsAppAdapter");
const PuppeteerPdfGenerator_1 = require("../../infrastructure/services/PuppeteerPdfGenerator");
// Use Cases
const RegisterCompany_1 = require("../../application/use-cases/auth/RegisterCompany");
const LoginUser_1 = require("../../application/use-cases/auth/LoginUser");
const RefreshTokenUseCase_1 = require("../../application/use-cases/auth/RefreshTokenUseCase");
const RegisterClientUser_1 = require("../../application/use-cases/auth/RegisterClientUser");
const CreateQuote_1 = require("../../application/use-cases/quote/CreateQuote");
const GenerateQuotePdf_1 = require("../../application/use-cases/quote/GenerateQuotePdf");
const SendQuoteViaWhatsApp_1 = require("../../application/use-cases/quote/SendQuoteViaWhatsApp");
const CreateService_1 = require("../../application/use-cases/service/CreateService");
// Controllers
const AuthController_1 = require("./controllers/AuthController");
const QuoteController_1 = require("./controllers/QuoteController");
const ServiceController_1 = require("./controllers/ServiceController");
const ClientController_1 = require("./controllers/ClientController");
// Middlewares
const AuthMiddleware_1 = require("./middlewares/AuthMiddleware");
const router = (0, express_1.Router)();
exports.router = router;
const prisma = new client_1.PrismaClient();
// Dependency Injection Factory (Simulated)
const userRepo = new PrismaUserRepository_1.PrismaUserRepository(prisma);
const companyRepo = new PrismaCompanyRepository_1.PrismaCompanyRepository(prisma);
const clientRepo = new PrismaClientRepository_1.PrismaClientRepository(prisma);
const refreshRepo = new PrismaRefreshTokenRepository_1.PrismaRefreshTokenRepository(prisma);
const quoteRepo = new PrismaQuoteRepository_1.PrismaQuoteRepository(prisma);
const serviceRepo = new PrismaServiceRepository_1.PrismaServiceRepository(prisma);
const hasher = new BcryptPasswordHasher_1.BcryptPasswordHasher();
const jwtSvc = new JwtService_1.JwtService();
const notifySvc = new EvolutionApiWhatsAppAdapter_1.EvolutionApiWhatsAppAdapter();
const pdfSvc = new PuppeteerPdfGenerator_1.PuppeteerPdfGenerator();
const authMiddleware = new AuthMiddleware_1.AuthMiddleware(jwtSvc);
// Use Cases Injection
const regCompanyUC = new RegisterCompany_1.RegisterCompany(companyRepo, userRepo, hasher);
const loginUC = new LoginUser_1.LoginUser(userRepo, refreshRepo, hasher, jwtSvc);
const refreshUC = new RefreshTokenUseCase_1.RefreshTokenUseCase(refreshRepo, jwtSvc);
const regClientUC = new RegisterClientUser_1.RegisterClientUser(clientRepo, userRepo, hasher);
const createQuoteUC = new CreateQuote_1.CreateQuote(quoteRepo, clientRepo, serviceRepo);
const genPdfUC = new GenerateQuotePdf_1.GenerateQuotePdf(quoteRepo, companyRepo, clientRepo, pdfSvc);
const sendWaUC = new SendQuoteViaWhatsApp_1.SendQuoteViaWhatsApp(quoteRepo, clientRepo, notifySvc, genPdfUC);
const createServiceUC = new CreateService_1.CreateService(serviceRepo);
// Controllers Injection
const authCtrl = new AuthController_1.AuthController(regCompanyUC, loginUC, refreshUC, regClientUC, companyRepo);
const quoteCtrl = new QuoteController_1.QuoteController(createQuoteUC, genPdfUC, sendWaUC, quoteRepo);
const serviceCtrl = new ServiceController_1.ServiceController(createServiceUC, serviceRepo);
const clientCtrl = new ClientController_1.ClientController(clientRepo);
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
router.delete('/services/:id', authMiddleware.handle, authMiddleware.roleRequired([User_1.Role.ADMIN]), serviceCtrl.deleteHandler);
// Clients (Protected)
router.get('/clients', authMiddleware.handle, clientCtrl.getAllHandler);
router.get('/clients/:id', authMiddleware.handle, clientCtrl.getOneHandler);
router.patch('/clients/:id', authMiddleware.handle, clientCtrl.updateHandler);

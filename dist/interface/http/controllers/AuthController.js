"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
class AuthController {
    registerCompany;
    loginUser;
    refreshTokenUseCase;
    registerClientUser;
    companyRepository;
    constructor(registerCompany, loginUser, refreshTokenUseCase, registerClientUser, companyRepository) {
        this.registerCompany = registerCompany;
        this.loginUser = loginUser;
        this.refreshTokenUseCase = refreshTokenUseCase;
        this.registerClientUser = registerClientUser;
        this.companyRepository = companyRepository;
    }
    registerCompanyHandler = async (req, res, next) => {
        try {
            const result = await this.registerCompany.execute(req.body);
            res.status(201).json(result);
        }
        catch (error) {
            next(error);
        }
    };
    loginHandler = async (req, res, next) => {
        try {
            const result = await this.loginUser.execute(req.body);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    };
    refreshHandler = async (req, res, next) => {
        try {
            const result = await this.refreshTokenUseCase.execute(req.body);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    };
    registerClientHandler = async (req, res, next) => {
        try {
            // Find companyId from phone in metadata (Simulated by req.body.companyPhone or similar for now)
            // As per instructions: "The endpoint will receive the phone number's company in the metadata"
            const { phone, email, password, companyPhone } = req.body;
            const company = await this.companyRepository.findByPhone(companyPhone);
            if (!company) {
                return res.status(404).json({ error: 'Company not found for this phone metadata' });
            }
            await this.registerClientUser.execute({
                companyId: company.id,
                phone,
                email,
                password
            });
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    };
}
exports.AuthController = AuthController;

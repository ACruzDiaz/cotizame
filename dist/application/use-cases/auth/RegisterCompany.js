"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterCompany = void 0;
const Company_1 = require("../../../domain/entities/Company");
const User_1 = require("../../../domain/entities/User");
class RegisterCompany {
    companyRepository;
    userRepository;
    passwordHasher;
    constructor(companyRepository, userRepository, passwordHasher) {
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
    }
    async execute(request) {
        const existingCompany = await this.companyRepository.findByPhone(request.companyPhone);
        if (existingCompany) {
            throw new Error('Company with this phone already exists');
        }
        const existingUser = await this.userRepository.findByEmail(request.adminEmail);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }
        const company = Company_1.Company.create({
            name: request.companyName,
            phone: request.companyPhone,
            plan: Company_1.Plan.FREE,
        });
        const createdCompany = await this.companyRepository.create(company);
        const passwordHash = await this.passwordHasher.hash(request.adminPassword);
        const admin = User_1.User.create({
            companyId: createdCompany.id,
            name: request.adminName,
            email: request.adminEmail,
            passwordHash: passwordHash,
            role: User_1.Role.ADMIN,
        });
        const createdAdmin = await this.userRepository.create(admin);
        return {
            companyId: createdCompany.id,
            adminId: createdAdmin.id,
        };
    }
}
exports.RegisterCompany = RegisterCompany;

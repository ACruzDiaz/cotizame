"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaUserRepository = void 0;
const User_1 = require("../../domain/entities/User");
class PrismaUserRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(user) {
        const createdUser = await this.prisma.user.create({
            data: {
                id: user.id,
                companyId: user.companyId,
                name: user.name,
                email: user.email,
                passwordHash: user.passwordHash,
                role: user.role,
            },
        });
        return User_1.User.create({
            ...createdUser,
            role: createdUser.role,
        });
    }
    async findById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user)
            return null;
        return User_1.User.create({
            ...user,
            role: user.role,
        });
    }
    async findByEmail(email) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user)
            return null;
        return User_1.User.create({
            ...user,
            role: user.role,
        });
    }
    async findByCompanyId(companyId) {
        const users = await this.prisma.user.findMany({
            where: { companyId },
        });
        return users.map((user) => User_1.User.create({
            ...user,
            role: user.role,
        }));
    }
}
exports.PrismaUserRepository = PrismaUserRepository;

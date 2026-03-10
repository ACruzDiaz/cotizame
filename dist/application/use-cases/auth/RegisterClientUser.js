"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterClientUser = void 0;
const User_1 = require("../../../domain/entities/User");
class RegisterClientUser {
    clientRepository;
    userRepository;
    passwordHasher;
    constructor(clientRepository, userRepository, passwordHasher) {
        this.clientRepository = clientRepository;
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
    }
    async execute(input) {
        const client = await this.clientRepository.findByPhone(input.companyId, input.phone);
        if (!client) {
            throw new Error('No client found with this phone number for this company');
        }
        if (client.userId) {
            throw new Error('Client is already registered');
        }
        const existingUser = await this.userRepository.findByEmail(input.email);
        if (existingUser) {
            throw new Error('Email already in use');
        }
        const passwordHash = await this.passwordHasher.hash(input.password);
        const user = User_1.User.create({
            companyId: input.companyId,
            name: input.name || client.name || 'Client', // Fallback to provided name, client name or 'Client'
            email: input.email,
            passwordHash,
            role: User_1.Role.CLIENT,
        });
        const createdUser = await this.userRepository.create(user);
        client.register(createdUser.id);
        await this.clientRepository.update(client);
    }
}
exports.RegisterClientUser = RegisterClientUser;

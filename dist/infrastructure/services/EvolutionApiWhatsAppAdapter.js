"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvolutionApiWhatsAppAdapter = void 0;
const axios_1 = __importDefault(require("axios"));
class EvolutionApiWhatsAppAdapter {
    apiUrl;
    apiKey;
    constructor() {
        this.apiUrl = process.env.EVOLUTION_API_URL || '';
        this.apiKey = process.env.EVOLUTION_API_KEY || '';
    }
    async sendMessage(to, message) {
        try {
            await axios_1.default.post(`${this.apiUrl}/message/sendText/{{instance_name}}`, // instance_name should be dynamically set or configured
            {
                number: to,
                text: message,
            }, {
                headers: { apikey: this.apiKey },
            });
        }
        catch (error) {
            console.error('Error sending WhatsApp message:', error);
            throw new Error('Failed to send WhatsApp message');
        }
    }
    async sendDocument(to, fileUrl, fileName) {
        try {
            await axios_1.default.post(`${this.apiUrl}/message/sendMedia/{{instance_name}}`, {
                number: to,
                media: fileUrl,
                mediatype: 'document',
                fileName: fileName,
            }, {
                headers: { apikey: this.apiKey },
            });
        }
        catch (error) {
            console.error('Error sending WhatsApp document:', error);
            throw new Error('Failed to send WhatsApp document');
        }
    }
}
exports.EvolutionApiWhatsAppAdapter = EvolutionApiWhatsAppAdapter;

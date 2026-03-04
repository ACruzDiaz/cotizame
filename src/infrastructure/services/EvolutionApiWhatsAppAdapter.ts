import axios from 'axios';
import { INotificationService } from '../../domain/interfaces/services/INotificationService';

export class EvolutionApiWhatsAppAdapter implements INotificationService {
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.apiUrl = process.env.EVOLUTION_API_URL || '';
    this.apiKey = process.env.EVOLUTION_API_KEY || '';
  }

  public async sendMessage(to: string, message: string): Promise<void> {
    try {
      await axios.post(
        `${this.apiUrl}/message/sendText/{{instance_name}}`, // instance_name should be dynamically set or configured
        {
          number: to,
          text: message,
        },
        {
          headers: { apikey: this.apiKey },
        },
      );
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw new Error('Failed to send WhatsApp message');
    }
  }

  public async sendDocument(to: string, fileUrl: string, fileName: string): Promise<void> {
    try {
      await axios.post(
        `${this.apiUrl}/message/sendMedia/{{instance_name}}`,
        {
          number: to,
          media: fileUrl,
          mediatype: 'document',
          fileName: fileName,
        },
        {
          headers: { apikey: this.apiKey },
        },
      );
    } catch (error) {
      console.error('Error sending WhatsApp document:', error);
      throw new Error('Failed to send WhatsApp document');
    }
  }
}

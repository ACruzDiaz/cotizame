export interface INotificationService {
  sendMessage(to: string, message: string): Promise<void>;
  sendDocument(to: string, fileUrl: string, fileName: string): Promise<void>;
}

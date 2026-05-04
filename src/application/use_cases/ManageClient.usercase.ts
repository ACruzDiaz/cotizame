import { ClientRequestDTO } from "../dtos/client.requestDTO";
import { ClientService } from "../services/client.service";
import type { Client } from "../../generated/prisma/client";
import { CompanyService } from "../services/company.service";
export class ManageClientUseCase {
  constructor(
    private clientService: ClientService,
    private companyService: CompanyService
  ) {}

  public async execute(data: unknown): Promise<Client> {
    try {
      //Siempre se recibe el numero de el cliente
      const clientPhone = ClientRequestDTO.clientPhone(data);

      const exist = await this.clientService.getByProperty({
        clientPhone: clientPhone.clientPhone,
      });
      if (exist && exist.length > 0) {
        return exist[0]!;
      }
      //Se recibe junto al usuario el numero telefonico de la compañia
      const companyPhone = ClientRequestDTO.companyPhone(data);
      //const parseData = ClientRequestDTO.create(data);

      //Obtenemos el ID, phone y name de de la compañia
      const companyInfo = await this.companyService.getByPhoneNumber(
        companyPhone.companyPhone
      );
      if (!companyInfo)
        throw new Error("Error creating client. Company do not exist");

      const parseData = {
        companyId: companyInfo.id,
        clientPhone: clientPhone.clientPhone,
      };
      const payload = await this.clientService.create(parseData);
      return payload;
    } catch (error) {
      throw error;
    }
  }
}
//Despues le pasamos el cliente a la IA para que determine sus intenciones

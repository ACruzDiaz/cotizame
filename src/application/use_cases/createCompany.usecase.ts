import  { CompanyRequestDTO } from "../dtos/company.requestDTO";
import  { CompanyService } from "../services/company.service";

class CreateCompanyUseCase {
  constructor(private companyService: CompanyService) {}

  public async execute(data:unknown){
    const parseData = CompanyRequestDTO.create(data)
    const payload = await this.companyService.create(parseData)
    //return CompanyResponseDTO.created(payload)
    return payload
  }
}

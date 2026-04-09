import { ProductService } from "../services/product.service";
import { ProductRequestDTO } from "../dtos/product.requestDTO";
class ShowProductsUseCase{
    constructor(private productService: ProductService) {}
  public async execute(data:unknown){
    const parseData = ProductRequestDTO.getAll(data)
    const allProducts = await this.productService.getAll(parseData.companyId)
    return allProducts
  }
}
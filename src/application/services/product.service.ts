import { PrismaClient } from "../../generated/prisma/client.js";
import type { CompanyModel, CompanyCreateInput, ProductModel, CompanyGetPayload } from "../../generated/prisma/models.js"
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const dave = PrismaClient
const alan : CompanyCreateInput = {
  name: 'alan',
  phone_number: "234234",
  updated_at: ""
}
const getCompanies= async ()=>{
  return await prisma.company.findMany()

}

console.log(await getCompanies());
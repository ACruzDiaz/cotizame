import { prisma } from "../../src/application/connection/prismaClient.js";
import { CompanyTier } from "../../src/generated/prisma/enums.js";

const res = async() =>  await prisma.company.createMany({
  data:[{
    id: '295f5058-e9b1-436a-9a61-a36acc002914',
    phoneNumber: '15552020351',
    name: 'Detailing & Carwash',
    website: 'www.detailing&carwash.com',
    tier: CompanyTier.free,
    updatedAt: new Date()
  },{
    id: '295f5058-e9b1-431a-9a61-a36acc002914',
    phoneNumber: '15554020353',
    name: 'Company 2',
    website: 'www.company2.com',
    tier: CompanyTier.free,
    updatedAt: new Date()

  },{
    id: '295f5058-e9b1-432a-9a61-a36acc002914',
    phoneNumber: '15552050356',
    name: 'Company 3',
    website: 'www.company3.com',
    tier: CompanyTier.free,
    updatedAt: new Date()
  }
    
  ]
})

export default res;
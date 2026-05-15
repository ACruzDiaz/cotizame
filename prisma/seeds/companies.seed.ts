import { prisma } from "../../src/application/connection/prismaClient";
import { CompanyTier } from "../../src/generated/prisma/enums";

const res = async() =>  await prisma.company.createMany({
  data:[{
    id: '295f5058-e9b1-436a-9a61-a36acc002914',
    phoneNumber: '5555555',
    name: 'Company 1',
    website: 'www.company1.com',
    tier: CompanyTier.free,
    updatedAt: new Date()
  },{
    id: '295f5058-e9b1-431a-9a61-a36acc002914',
    phoneNumber: '6666666',
    name: 'Company 2',
    website: 'www.company2.com',
    tier: CompanyTier.free,
    updatedAt: new Date()

  },{
    id: '295f5058-e9b1-432a-9a61-a36acc002914',
    phoneNumber: '7777777',
    name: 'Company 3',
    website: 'www.company3.com',
    tier: CompanyTier.free,
    updatedAt: new Date()
  }
    
  ]
})

export default res;
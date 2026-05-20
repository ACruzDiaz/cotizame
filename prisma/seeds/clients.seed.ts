import { prisma } from "../../src/application/connection/prismaClient.js";

const res = async() => await prisma.client.createMany({
  data: [
    {
      id: "a248e9b8-84dc-4891-89ac-7ab87752fd24",
      clientPhone: "1111111",
      companyId: "295f5058-e9b1-436a-9a61-a36acc002914",
      name: "Client 1",
    },
    {
      id: "81d26b94-58de-4f45-9ea5-ec06c1076c45",
      clientPhone: "2222222",
      companyId: "295f5058-e9b1-431a-9a61-a36acc002914",
      name: "Client 2",
    },
    {
      id: "5cef7f67-30e0-4c74-a8b0-c212216849be",
      clientPhone: "3333333",
      companyId: "295f5058-e9b1-432a-9a61-a36acc002914",
      name: "Client 3",
    },
  ],
});

export default res
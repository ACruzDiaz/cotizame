import { prisma } from "../../src/application/connection/prismaClient";
import { UserRole } from "../../src/generated/prisma/enums";

const res = async() =>  await prisma.user.createMany({
  data: [
    {
      id: "fb079ead-0af9-4337-b890-26ca43064642",
      companyId: "295f5058-e9b1-436a-9a61-a36acc002914",
      email: "user_1@gmail.com",
      passwordHash: "1234",
      role: UserRole.ADMIN,
    },
    {
      id: "227f06de-7580-427b-baad-186e6b7d5004",
      companyId: "295f5058-e9b1-431a-9a61-a36acc002914",
      email: "user_2@gmail.com",
      passwordHash: "1234",
      role: UserRole.ADMIN,
    },
    {
      id: "06b82416-2313-4983-8c4c-62205023c3e8",
      companyId: "295f5058-e9b1-432a-9a61-a36acc002914",
      email: "user_3@gmail.com",
      passwordHash: "1234",
      role: UserRole.ADMIN,
    },
  ],
});

export default res;
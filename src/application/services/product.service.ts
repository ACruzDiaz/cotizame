import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const setData = async() => {
  return await prisma.company.create({
    data: {
      name: "deloite",
      phone_number: '3132111323',
      updated_at: new Date(),
    }
  })
}

const getData = async() => {
  return await prisma.company.findMany()
}

const inOrder = async() =>{
  const res = await setData()
  console.log(res);

  const data = await getData()
  console.log(data);
}

inOrder()
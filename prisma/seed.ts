import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

import companiesSeed from "./seeds/companies.seed.js";
import productsSeed from "./seeds/products.seed.js";
import usersSeed from "./seeds/users.seed.js";
import clientSeed from "./seeds/clients.seed.js";
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({
  adapter,
});
async function seeder() {
  console.log("🌱 Seeding test data...");
  // Clear existing records
  await prisma.client.deleteMany();
  await prisma.company.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  await companiesSeed();
  await productsSeed();
  await usersSeed();
  await clientSeed();
  console.log("Project seeded!");
}

seeder()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

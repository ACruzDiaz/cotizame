import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";

import { execa } from "execa";

let container: StartedPostgreSqlContainer;

console.log("[vitest.setup] inicializando contenedor de testcontainers...");
try {
  container = await new PostgreSqlContainer("postgres:13.3-alpine")
    .withDatabase("testdb")
    .withUsername("testuser")
    .withPassword("testpass")
    .start();

  process.env.DATABASE_URL = container.getConnectionUri();
  // Ejecutar migraciones

  await execa("pnpm", ["prisma", "db", "push"]);
  console.log("[vitest.setup] contenedor arrancado:", process.env.DATABASE_URL);

} catch (err) {
  console.error("[vitest.setup] error arrancando contenedor:", err);
  throw err;
}

export default container;
export { container };
/**
 * Seed a single demo user for the Alloy preview environment.
 *
 * Idempotent: re-running is safe. Used by docker-compose.alloy.yaml after
 * `prisma migrate deploy` so the auto-login route (gated on IS_ALLOY=true)
 * has a real account to attach a session to.
 */
import dotEnv from "dotenv";
import path from "node:path";

// Load the repo-root .env so DATABASE_URL is available when invoked via
// `ts-node` outside the Prisma CLI (which loads .env on its own).
dotEnv.config({ path: path.resolve(__dirname, "../.env") });

import { createUserAndEventType } from "../scripts/seed-utils";

export const ALLOY_DEMO_USER = {
  email: "alloy@example.com",
  username: "alloy",
  name: "Alloy Demo",
  password: "alloy",
} as const;

async function main() {
  await createUserAndEventType({
    user: {
      email: ALLOY_DEMO_USER.email,
      name: ALLOY_DEMO_USER.name,
      password: ALLOY_DEMO_USER.password,
      username: ALLOY_DEMO_USER.username,
      theme: "light",
      completedOnboarding: true,
    },
    eventTypes: [
      { title: "30 min meeting", slug: "30min", length: 30 },
      { title: "15 min meeting", slug: "15min", length: 15 },
    ],
  });
  console.log(`>>> Alloy demo user ready: ${ALLOY_DEMO_USER.email}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    const { default: prisma } = await import("@calcom/prisma");
    await prisma.$disconnect();
  });

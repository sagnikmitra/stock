import { PrismaClient } from "@prisma/client";
import { seedExchanges } from "./exchanges";
import { seedProviders } from "./providers";
import { seedStrategies } from "./strategies";
import { seedScreeners } from "./screeners";
import { seedExternalResources } from "./external-resources";
import { seedKnowledge } from "./knowledge";
import { seedAmbiguities } from "./ambiguities";
import { seedFeatureFlags } from "./feature-flags";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Investment Bible OS...\n");

  await seedExchanges(prisma);
  await seedProviders(prisma);
  await seedStrategies(prisma);
  await seedScreeners(prisma);
  await seedExternalResources(prisma);
  await seedKnowledge(prisma);
  await seedAmbiguities(prisma);
  await seedFeatureFlags(prisma);

  console.log("\n✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

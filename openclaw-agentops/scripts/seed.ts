import { clearRuns, insertRuns } from "../src/lib/repository";
import { generateDemoRuns } from "../src/lib/seed";

function main() {
  clearRuns();
  const inserted = insertRuns(generateDemoRuns());
  console.log(`Seeded ${inserted.length} demo agent runs into data/agentops.db`);
}

main();

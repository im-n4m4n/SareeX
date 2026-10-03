import { seedDatabase } from "./seed";
import { pool } from "./index";

seedDatabase(process.argv.includes("--force"), true)
  .then(() => console.log("Seed complete"))
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => pool.end());

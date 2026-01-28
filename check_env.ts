import * as dotenv from "dotenv";
dotenv.config({ path: "../.env" });

console.log("Checking environment...");
if (process.env.DATABASE_URL) {
  console.log(
    "DATABASE_URL is set (starting with " +
      process.env.DATABASE_URL.substring(0, 10) +
      ")",
  );
} else {
  console.log("DATABASE_URL is NOT set");
}

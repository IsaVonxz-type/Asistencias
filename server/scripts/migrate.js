import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { query } from "../models/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, "../db/schema.sql"), "utf8");
  try {
    await query(sql);
    console.log("✅ Database schema applied successfully.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();

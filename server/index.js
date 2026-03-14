import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import apiRouter from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
  cors({ origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173" }),
);
app.use(express.json());

app.use("/api", apiRouter);

// In development, show a simple message at root to avoid 404 when hitting the server directly
app.get("/", (req, res) => {
  if (process.env.NODE_ENV === "production") {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
    return;
  }
  res.send(
    "Servidor de API funcionando. Usa el frontend en http://localhost:5173 (o genera el build con pnpm --filter client build).",
  );
});

// Serve frontend build if exists
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
}

app.use(errorHandler);

const PORT = parseInt(process.env.PORT, 10) || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

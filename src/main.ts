import https from "https";
import fs from "fs";
import express from "express";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import cors from "cors";
import requestIp from "request-ip";
import "reflect-metadata";
import statusMonitor from "express-status-monitor";
import { usersController } from "@/resources/users/users.controller";
import { healthController } from "@/resources/health/health.controller";
import { modulesController } from "./resources/modules/modules.controller";
import logger from "@/utils/logger";

config();

const app = express();

const corsOptions = {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  exposedHeaders: ["set-cookie"]
};

logger.info("Configuring server middleware and CORS settings");

app.use(cookieParser());
app.use(cors(corsOptions));
app.use(requestIp.mw());
app.use(statusMonitor({
  title: 'Beyoutique Status',
  path: '/status',
}));
app.use("/", healthController);
app.use("/users", usersController);
app.use("/modules", modulesController);

logger.info("Middleware and routes configured successfully");

const port = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "production") {
  logger.info("Starting server in development mode with HTTPS");
  const httpsOptions = {
    key: fs.readFileSync(
      "/Users/helloiambguedes/Desktop/companies/fashion-marketplace/monolith/certs/localhost.key"
    ),
    cert: fs.readFileSync(
      "/Users/helloiambguedes/Desktop/companies/fashion-marketplace/monolith/certs/localhost.crt"
    )
  };

  https.createServer(httpsOptions, app).listen(port, () => {
    logger.info(`HTTPS Server is running on port ${port}`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
  });
} else {
  logger.info("Starting server in production mode");
  app.listen(port, () => {
    logger.info(`HTTP Server is running on port ${port}`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
  });
}

process.on("SIGINT", () => {
  logger.info(
    "Received SIGINT signal. Shutting down server gracefully..."
  );
  process.exit(0);
});

process.on("SIGTERM", () => {
  logger.info(
    "Received SIGTERM signal. Shutting down server gracefully..."
  );
  process.exit(0);
});

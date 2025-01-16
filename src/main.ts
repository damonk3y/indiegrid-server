
import express, { Response, Request } from "express";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import cors from "cors";
import requestIp from "request-ip";
import "reflect-metadata";
import statusMonitor from "express-status-monitor";
import waitlistRouter from "@/resources/waitlist";
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
  title: 'theindiegrid status',
  path: '/status',
}));
app.use("/waitlist", waitlistRouter);

app.get("/health", (_: Request, res: Response) => {
  res.status(200).send("OK");
});

const port = process.env.PORT || 3000;

logger.info("Starting server in production mode");
app.listen(port, () => {
  logger.info(`HTTP Server is running on port ${port}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
});

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

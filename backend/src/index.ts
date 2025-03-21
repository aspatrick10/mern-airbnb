import "dotenv/config";
import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";

import { APP_ORIGIN, NODE_ENV, PORT } from "./constants/env";
import authRoutes from "./routes/auth.route";
import errorHandler from "./middleware/errorHandler";
import authenticate from "./middleware/authenticate";

const prisma = new PrismaClient();
const app = express();

/* CONFIGURATION MIDDLEWARE */
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    // front end url (vite)
    origin: APP_ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());

/* API ROUTES */
app.use("/auth", authRoutes);

/* UNHANDLED ROUTES */
app.all("*", (_, res) => {
  res.status(404).json({
    message: "Cannot find route.",
  });
});

/* ERROR HANDLER */
app.use(errorHandler);

/* START SERVER */
app.listen(PORT, async () => {
  console.log(`Listening on port ${PORT} in ${NODE_ENV} mode.`);
});

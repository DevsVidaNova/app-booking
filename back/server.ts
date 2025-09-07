import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import RoomRouter from "@/modules/room/router";
import BookingRouter from "@/modules/booking/router";
import AuthRouter from '@/modules/auth/router';
import UserRouter from "@/modules/user/router";
import MembersRouter from "@/modules/members/router";
import ScaleRouter from "@/modules/scale/router";
import AnalyticsRouter from "@/modules/analytics/router";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { apiReference } from "@scalar/express-api-reference";
import { init } from "@/config/db";

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(cors());

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development"
  });
});

app.use("/room", RoomRouter);
app.use("/booking", BookingRouter);
app.use("/auth", AuthRouter);
app.use("/user", UserRouter);
app.use("/members", MembersRouter);
app.use("/scale", ScaleRouter);
app.use("/analytics", AnalyticsRouter);

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Agendamento",
      version: "1.0.0",
      description: "Documentação da API do sistema de agendamento",
    },
  },
  apis: ["./modules/**/*.ts"],
});
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/openapi.json", (_req, res) => {
  res.json(swaggerSpec);
});

app.use(
  "/docs",
  apiReference({
    theme: "default",
    url: "/openapi.json"
  })
);


app.listen(port, () => {
  console.log(`✅ Servidor rodando na porta http://localhost:${port}`);
  init();
});

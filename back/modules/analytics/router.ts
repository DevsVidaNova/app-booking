import express from "express";
import {requireAdmin} from "@/config/middleware";
import { getStats } from "./controller";

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Rotas de estatísticas e análises
 */
const AnalyticsRouter = express.Router();

/**
 * @swagger
 * /analytics:
 *   get:
 *     summary: Retorna estatísticas do sistema
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas retornadas com sucesso
 */
AnalyticsRouter.route("/").get(requireAdmin, getStats);

export default AnalyticsRouter;
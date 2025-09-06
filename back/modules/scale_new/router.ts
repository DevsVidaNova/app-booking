import express from "express";
import { requireAdmin, requireAuth } from "@/config/middleware";
import {
  createScale,
  getScales,
  getScaleById,
  updateScale,
  deleteScale,
  searchScale,
  duplicateScale
} from "./controller";

/**
 * @swagger
 * tags:
 *   name: Scales
 *   description: Gerenciamento de escalas
 */
const ScaleRouter = express.Router();

/**
 * @swagger
 * /scale:
 *   post:
 *     summary: Cria uma nova escala
 *     tags: [Scales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Scale'
 *     responses:
 *       201:
 *         description: Escala criada com sucesso
 *       400:
 *         description: Dados inválidos
 */
ScaleRouter.route("/").post(requireAdmin, createScale);
/**
 * @swagger
 * /scale:
 *   get:
 *     summary: Lista todas as escalas
 *     tags: [Scales]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de escalas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Scale'
 */
ScaleRouter.route("/").get(requireAuth, getScales);
/**
 * @swagger
 * /scale/search:
 *   put:
 *     summary: Busca escalas por parâmetros
 *     tags: [Scales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Escalas encontradas
 */
ScaleRouter.route("/search").put(requireAdmin, searchScale);
/**
 * @swagger
 * /scale/duplicate/{id}:
 *   post:
 *     summary: Duplica uma escala
 *     tags: [Scales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Escala duplicada
 *       404:
 *         description: Escala não encontrada
 */
ScaleRouter.route("/duplicate/:id").post(requireAdmin, duplicateScale);

/**
 * @swagger
 * /scale/{id}:
 *   delete:
 *     summary: Remove uma escala
 *     tags: [Scales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Escala removida
 *       404:
 *         description: Escala não encontrada
 */
ScaleRouter.route("/:id").delete(requireAdmin, deleteScale);
/**
 * @swagger
 * /scale/{id}:
 *   put:
 *     summary: Atualiza uma escala
 *     tags: [Scales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Scale'
 *     responses:
 *       200:
 *         description: Escala atualizada
 *       404:
 *         description: Escala não encontrada
 */
ScaleRouter.route("/:id").put(requireAdmin, updateScale);
/**
 * @swagger
 * /scale/{id}:
 *   get:
 *     summary: Busca uma escala pelo ID
 *     tags: [Scales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Escala encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Scale'
 *       404:
 *         description: Escala não encontrada
 */
ScaleRouter.route("/:id").get(requireAuth, getScaleById);

export default ScaleRouter;

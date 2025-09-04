import { Router } from "express";
import { requireAdmin, publicRoute } from "@/config/middleware";
import { createRoom, getRooms, searchRoom, deleteRoom, getRoomById, updateRoom } from "./controller";
/**
 * @swagger
 * tags:
 *   name: Rooms
 *   description: Gerenciamento de salas
 */
const RoomRouter = Router();

/**
 * @swagger
 * /room:
 *   post:
 *     summary: Cria uma nova sala
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Room'
 *     responses:
 *       201:
 *         description: Sala criada com sucesso
 *       400:
 *         description: Dados inválidos
 */
RoomRouter.route("/").post(requireAdmin, createRoom);
/**
 * @swagger
 * /room:
 *   get:
 *     summary: Lista todas as salas
 *     tags: [Rooms]
 *     responses:
 *       200:
 *         description: Lista de salas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Room'
 */
RoomRouter.route("/").get(publicRoute, getRooms); 
/**
 * @swagger
 * /room/search:
 *   get:
 *     summary: Busca salas por parâmetros
 *     tags: [Rooms]
 *     parameters:
 *       - in: query
 *         name: nome
 *         schema:
 *           type: string
 *         description: Nome da sala
 *     responses:
 *       200:
 *         description: Resultado da busca
 */
RoomRouter.route("/search").get(publicRoute, searchRoom); 

/**
 * @swagger
 * /room/{id}:
 *   delete:
 *     summary: Remove uma sala
 *     tags: [Rooms]
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
 *         description: Sala removida
 *       404:
 *         description: Sala não encontrada
 */
RoomRouter.route("/:id").delete(requireAdmin, deleteRoom);
/**
 * @swagger
 * /room/{id}:
 *   get:
 *     summary: Busca uma sala pelo ID
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sala encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Room'
 *       404:
 *         description: Sala não encontrada
 */
RoomRouter.route("/:id").get(publicRoute, getRoomById); 
/**
 * @swagger
 * /room/{id}:
 *   put:
 *     summary: Atualiza uma sala
 *     tags: [Rooms]
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
 *             $ref: '#/components/schemas/Room'
 *     responses:
 *       200:
 *         description: Sala atualizada
 *       404:
 *         description: Sala não encontrada
 */
RoomRouter.route("/:id").put(requireAdmin, updateRoom); 

export default RoomRouter;

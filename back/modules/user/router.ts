import express from "express";
import { requireAdmin } from "@/config/middleware";
import {
  showUser,
  listUsers,
  deleteUser,
  updateUser,
  createUser,
  listUsersScale,
  resetUserPassword
} from "./controller";

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gerenciamento de usuários
 */
const UserRouter = express.Router();

/**
 * @swagger
 * /user:
 *   post:
 *     summary: Cria um novo usuário
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
UserRouter.route("/").post(requireAdmin, createUser);
/**
 * @swagger
 * /user:
 *   get:
 *     summary: Lista todos os usuários
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
UserRouter.route("/").get(requireAdmin, listUsers);
/**
 * @swagger
 * /user/scale:
 *   get:
 *     summary: Lista usuários por escala
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários por escala
 */
UserRouter.route("/scale").get(requireAdmin, listUsersScale);
/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Busca um usuário pelo ID
 *     tags: [Users]
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
 *         description: Usuário encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuário não encontrado
 */
UserRouter.route("/:id").get(requireAdmin, showUser);
/**
 * @swagger
 * /user/{id}:
 *   delete:
 *     summary: Remove um usuário
 *     tags: [Users]
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
 *         description: Usuário removido
 *       404:
 *         description: Usuário não encontrado
 */
UserRouter.route("/:id").delete(requireAdmin, deleteUser);
/**
 * @swagger
 * /user/{id}:
 *   put:
 *     summary: Atualiza um usuário
 *     tags: [Users]
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
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Usuário atualizado
 *       404:
 *         description: Usuário não encontrado
 */
UserRouter.route("/:id").put(requireAdmin, updateUser);
/**
 * @swagger
 * /user/{id}/reset-password:
 *   patch:
 *     summary: Reseta a senha do usuário
 *     tags: [Users]
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
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Senha resetada com sucesso
 *       404:
 *         description: Usuário não encontrado
 */
UserRouter.route("/:id/reset-password").patch(requireAdmin, resetUserPassword);

export default UserRouter;

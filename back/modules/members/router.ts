import { Router } from "express";
import { requireAdmin } from "@/config/middleware";
import {
  createMember,
  getMembers,
  getMemberById,
  updateMember,
  deleteMember,
  searchMember,
  searchByFilter,
  getAnalytics
} from "./controller";

/**
 * @swagger
 * tags:
 *   name: Members
 *   description: Gerenciamento de membros
 */
const MembersRouter = Router();

/**
 * @swagger
 * /members:
 *   post:
 *     summary: Cria um novo membro
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Member'
 *     responses:
 *       201:
 *         description: Membro criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
MembersRouter.post("/", requireAdmin, createMember);
/**
 * @swagger
 * /members:
 *   get:
 *     summary: Lista todos os membros
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de membros
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Member'
 */
MembersRouter.get("/", requireAdmin, getMembers);
/**
 * @swagger
 * /members/analytics:
 *   get:
 *     summary: Retorna dados analíticos dos membros
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados analíticos
 */
MembersRouter.get("/analytics", requireAdmin, getAnalytics);
/**
 * @swagger
 * /members/{id}:
 *   get:
 *     summary: Busca um membro pelo ID
 *     tags: [Members]
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
 *         description: Membro encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Member'
 *       404:
 *         description: Membro não encontrado
 */
MembersRouter.get("/:id", requireAdmin, getMemberById);
/**
 * @swagger
 * /members/{id}:
 *   put:
 *     summary: Atualiza um membro
 *     tags: [Members]
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
 *             $ref: '#/components/schemas/Member'
 *     responses:
 *       200:
 *         description: Membro atualizado
 *       404:
 *         description: Membro não encontrado
 */
MembersRouter.put("/:id", requireAdmin, updateMember);
/**
 * @swagger
 * /members/{id}:
 *   delete:
 *     summary: Remove um membro
 *     tags: [Members]
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
 *         description: Membro removido
 *       404:
 *         description: Membro não encontrado
 */
MembersRouter.delete("/:id", requireAdmin, deleteMember);
/**
 * @swagger
 * /members/search:
 *   post:
 *     summary: Busca membros por parâmetros
 *     tags: [Members]
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
 *         description: Membros encontrados
 */
MembersRouter.post("/search", requireAdmin, searchMember);
/**
 * @swagger
 * /members/filter:
 *   post:
 *     summary: Filtra membros por parâmetros
 *     tags: [Members]
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
 *         description: Membros filtrados
 */
MembersRouter.post("/filter", requireAdmin, searchByFilter);

export default MembersRouter;

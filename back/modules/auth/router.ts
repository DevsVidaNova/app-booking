import { Router } from "express";
import { publicRoute, requireAuth } from "@/config/middleware";
import { signUpUser, loginUser, deleteUser, getUserProfile, logout, updateUserProfile, verifyToken } from "./controller";
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Rotas de autenticação e perfil
 */
const AuthRouter = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra um novo usuário
 *     tags: [Auth]
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
 *         description: Usuário registrado com sucesso
 *       400:
 *         description: Dados inválidos
 */
AuthRouter.route("/register").post(signUpUser);
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Realiza login do usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Credenciais inválidas
 */
AuthRouter.route("/login").post(publicRoute, loginUser);
/**
 * @swagger
 * /auth/delete:
 *   delete:
 *     summary: Remove o usuário autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Usuário removido
 *       404:
 *         description: Usuário não encontrado
 */
AuthRouter.route("/delete").delete(requireAuth, deleteUser);
/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Retorna o perfil do usuário autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil do usuário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
AuthRouter.route("/profile").get(requireAuth, getUserProfile);
/**
 * @swagger
 * /auth/edit:
 *   put:
 *     summary: Atualiza o perfil do usuário autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Perfil atualizado
 *       404:
 *         description: Usuário não encontrado
 */
AuthRouter.route("/edit").put(requireAuth, updateUserProfile);
/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Realiza logout do usuário autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 */
AuthRouter.route("/logout").post(requireAuth, logout);

/**
 * @swagger
 * /auth/verify:
 *   post:
 *     summary: Verifica se o token JWT é válido
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Token inválido ou expirado
 */
AuthRouter.route("/verify").post(requireAuth, verifyToken);

export default AuthRouter;
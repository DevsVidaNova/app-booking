import { RequestHandler } from 'express';
import { JWTUtils } from '@/utils/jwt';
import { db } from '@/config/db';

// 📌 1. Necessita de autenticação
const requireAuth: RequestHandler = async (req, res, next) => {
  const token = JWTUtils.getTokenFromRequest(req);

  if (!token) {
    res.status(401).json({
      error: 'Token não fornecido. Formato esperado: Bearer <token>'
    });
    return;
  }

  const payload = JWTUtils.verifyToken(token);
  if (!payload) {
    res.status(401).json({
      error: 'Token inválido ou expirado'
    });
    return;
  }

  const user = await db.user.findUnique({ where: { id: payload.userId } });
  if (!user) {
    res.status(401).json({
      error: 'Usuário não encontrado'
    });
    return;
  }

  (req as any).user = user;
  (req as any).role = user.role;
  next();
};

// 📌 2. Apenas admin pode acessar
const requireAdmin: RequestHandler = async (req, res, next) => {
  const token = JWTUtils.getTokenFromRequest(req);

  if (!token) {
    res.status(401).json({
      error: 'Token não fornecido. Formato esperado: Bearer <token>'
    });
    return;
  }

  const payload = JWTUtils.verifyToken(token);
  if (!payload) {
    res.status(401).json({
      error: 'Token inválido ou expirado'
    });
    return;
  }

  const user = await db.user.findUnique({ where: { id: payload.userId } });
  if (!user) {
    res.status(401).json({
      error: 'Usuário não encontrado'
    });
    return;
  }

  if (user.role !== 'ADMIN') {
    res.status(403).json({
      error: 'Acesso negado. Somente administradores podem acessar.'
    });
    return;
  }

  (req as any).user = user;
  (req as any).role = user.role;
  next();
};

// 📌 3. Sem necessidade de autenticação
const publicRoute: RequestHandler = (_req, _res, next) => {
  next();
};

export { requireAuth, requireAdmin, publicRoute };
import { Request, Response, NextFunction } from 'express';
import { JWTUtils } from '@/utils/jwt';

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

export const authMiddleware = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const token = JWTUtils.getTokenFromRequest(req);

        if (!token) {
            res.status(401).json({
                error: { message: 'Token de acesso não fornecido.' }
            });
            return;
        }

        const payload = JWTUtils.verifyToken(token);

        if (!payload) {
            res.status(401).json({
                error: { message: 'Token inválido ou expirado.' }
            });
            return;
        }

        // Adicionar informações do usuário ao request
        req.user = {
            id: payload.userId,
            email: payload.email,
            role: payload.role
        };

        next();
    } catch (error) {
        console.error('Erro no middleware de autenticação:', error);
        res.status(500).json({
            error: { message: 'Erro interno do servidor.' }
        });
    }
};

export const adminMiddleware = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Primeiro verifica se está autenticado
        await new Promise<void>((resolve, reject) => {
            authMiddleware(req, res, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // Depois verifica se é admin
        if (req.user?.role !== 'ADMIN') {
            res.status(403).json({
                error: { message: 'Acesso negado. Apenas administradores podem acessar este recurso.' }
            });
            return;
        }

        next();
    } catch (error) {
        console.error('Erro no middleware de admin:', error);
        res.status(500).json({
            error: { message: 'Erro interno do servidor.' }
        });
    }
};

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-super-segura';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}

export class JWTUtils {
    static generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
        return jwt.sign(payload, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        } as jwt.SignOptions);
    }

    static verifyToken(token: string): JWTPayload | null {
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
            return decoded;
        } catch (error) {
            console.error('Erro ao verificar JWT:', error);
            return null;
        }
    }

    static extractTokenFromHeader(authHeader: string | undefined): string | null {
        if (!authHeader) return null;

        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return null;
        }

        return parts[1];
    }

    static getTokenFromRequest(req: any): string | null {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        return this.extractTokenFromHeader(authHeader);
    }
}

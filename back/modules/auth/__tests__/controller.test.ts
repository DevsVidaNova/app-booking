import { signUpUser, loginUser, getUserProfile, updateUserProfile, deleteUser, logout, verifyToken } from '../controller';
import { AuthHandler } from '../handler';

// Mock do handler
jest.mock('../handler');
const mockHandler = AuthHandler as jest.Mocked<typeof AuthHandler>;

describe('Auth Controller', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    req = {
      body: {},
      query: {},
      user: { id: 'user-123' },
      role: 'user'
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    // Default mocks
    mockHandler.signUp.mockResolvedValue({ 
      user: { id: 'user-123', email: 'test@test.com', name: 'Test User', phone: '123456789', role: 'USER' },
      token: 'token123'
    });
    mockHandler.login.mockResolvedValue({ 
      user: { id: 'user-123', email: 'test@test.com', name: 'Test User', phone: '123456789', role: 'USER' }, 
      token: 'token123'
    });
    mockHandler.getProfile.mockResolvedValue({ 
      user: { id: 'profile-123', name: 'Test User', email: 'test@test.com', phone: '123456789', role: 'USER' } 
    });
    mockHandler.updateProfile.mockResolvedValue({ 
      user: { id: 'profile-123', name: 'Updated User', phone: '123456789', email: 'test@test.com', role: 'USER' } 
    });
    mockHandler.delete.mockResolvedValue({ success: true });
    mockHandler.logout.mockResolvedValue({ success: true });
    mockHandler.verifyToken.mockResolvedValue({ 
      user: { id: 'user-123', email: 'test@test.com', name: 'Test User', phone: '123456789', role: 'USER' } 
    });
  });

  describe('signUpUser', () => {
    it('should create user successfully', async () => {
      req.body = { email: 'test@test.com', password: 'password123', name: 'Test User', phone: '1234567890' };
      
      await signUpUser(req, res);
      
      expect(mockHandler.signUp).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123',
        name: 'Test User',
        phone: '1234567890'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Usuário registrado com sucesso',
        user: { id: 'user-123', email: 'test@test.com', name: 'Test User', phone: '123456789', role: 'USER' },
        token: 'token123'
      });
    });

    it('should return 400 when validation fails', async () => {
      req.body = { email: 'invalid-email' }; // invalid email format
      
      await signUpUser(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(Array) });
      expect(mockHandler.signUp).not.toHaveBeenCalled();
    });

    it('should return 400 when handler returns error', async () => {
      req.body = { email: 'test@test.com', password: 'password123', name: 'Test User', phone: '1234567890' };
      mockHandler.signUp.mockResolvedValue({ error: { message: 'Email já existe' } });
      
      await signUpUser(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Email já existe' });
    });
  });

  describe('loginUser', () => {
    it('should login user successfully', async () => {
      req.body = { email: 'test@test.com', password: 'password123' };
      
      await loginUser(req, res);
      
      expect(mockHandler.login).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123'
      });
      expect(res.json).toHaveBeenCalledWith({
        user: { id: 'user-123', email: 'test@test.com', name: 'Test User', phone: '123456789', role: 'USER' },
        token: 'token123'
      });
    });

    it('should return 400 when validation fails', async () => {
      req.body = { email: 'invalid-email', password: '123' }; // invalid email and short password
      
      await loginUser(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(Array) });
      expect(mockHandler.login).not.toHaveBeenCalled();
    });

    it('should return 401 when handler returns error', async () => {
      req.body = { email: 'test@test.com', password: 'wrongpassword' };
      mockHandler.login.mockResolvedValue({ error: { message: 'Credenciais inválidas' } });
      
      await loginUser(req, res);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Credenciais inválidas' });
    });
  });

  describe('getUserProfile', () => {
    it('should get user profile successfully with user ID from query', async () => {
      req.query.id = 'user-123';
      req.role = 'admin';
      
      await getUserProfile(req, res);
      
      expect(mockHandler.getProfile).toHaveBeenCalledWith('user-123');
      expect(res.json).toHaveBeenCalledWith({
        user: {
          id: 'profile-123',
          name: 'Test User',
          email: 'test@test.com',
          phone: '123456789',
          role: 'USER'
        }
      });
    });

    it('should get user profile successfully with user ID from req.user', async () => {
      req.user.id = 'user-123';
      
      await getUserProfile(req, res);
      
      expect(mockHandler.getProfile).toHaveBeenCalledWith('user-123');
      expect(res.json).toHaveBeenCalledWith({
        user: {
          id: 'profile-123',
          name: 'Test User',
          email: 'test@test.com',
          phone: '123456789',
          role: 'USER'
        }
      });
    });

    it('should return 400 when user ID is not found', async () => {
      req.query = {};
      req.user = {};
      
      await getUserProfile(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'ID do usuário não encontrado.' });
      expect(mockHandler.getProfile).not.toHaveBeenCalled();
    });

    it('should return 403 when non-admin tries to access other user profile', async () => {
      req.query.id = 'other-user-123';
      req.user.id = 'user-123';
      req.role = 'user';
      
      await getUserProfile(req, res);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Acesso restrito. Somente administradores podem acessar perfis de outros usuários.' 
      });
      expect(mockHandler.getProfile).not.toHaveBeenCalled();
    });

    it('should return 400 when handler returns error', async () => {
      req.query.id = 'user-123';
      req.role = 'admin';
      mockHandler.getProfile.mockResolvedValue({ error: { message: 'Usuário não encontrado' } });
      
      await getUserProfile(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado' });
    });
  });
  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      req.query.id = 'profile-123';
      req.body = { name: 'Updated User', phone: '(11) 98765-4321' };
      req.role = 'admin';
      
      await updateUserProfile(req, res);
      
      expect(mockHandler.updateProfile).toHaveBeenCalledWith('profile-123', {
        name: 'Updated User',
        phone: '(11) 98765-4321'
      });
      expect(res.json).toHaveBeenCalledWith({
        message: 'Perfil atualizado com sucesso',
        user: { id: 'profile-123', name: 'Updated User', phone: '123456789', email: 'test@test.com', role: 'USER' }
      });
    });

    it('should return 400 when user ID is not found', async () => {
      req.query = {};
      req.user = {};
      
      await updateUserProfile(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'ID do usuário não encontrado.' });
      expect(mockHandler.updateProfile).not.toHaveBeenCalled();
    });

    it('should return 403 when non-admin tries to update other user profile', async () => {
      req.query.id = 'other-user-123';
      req.user.id = 'user-123';
      req.role = 'user';
      
      await updateUserProfile(req, res);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Acesso restrito. Somente administradores podem acessar perfis de outros usuários.' 
      });
      expect(mockHandler.updateProfile).not.toHaveBeenCalled();
    });

    it('should return 400 when validation fails', async () => {
      req.query.id = 'user-123';
      req.body = { name: '', phone: 'invalid-phone' }; // invalid data
      req.role = 'admin';
      
      await updateUserProfile(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(Array) });
      expect(mockHandler.updateProfile).not.toHaveBeenCalled();
    });

    it('should return 400 when handler returns error', async () => {
      req.query.id = 'user-123';
      req.body = { name: 'Updated User' };
      req.role = 'admin';
      mockHandler.updateProfile.mockResolvedValue({ error: { message: 'Erro ao atualizar' } });
      
      await updateUserProfile(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao atualizar' });
    });
  });
  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      req.user.id = 'user-123';
      
      await deleteUser(req, res);
      
      expect(mockHandler.delete).toHaveBeenCalledWith('user-123');
      expect(res.json).toHaveBeenCalledWith({ message: 'Usuário e perfil excluídos com sucesso.' });
    });

    it('should return 400 when user ID is not found', async () => {
      req.user = {};
      
      await deleteUser(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'ID do usuário não encontrado.' });
      expect(mockHandler.delete).not.toHaveBeenCalled();
    });

    it('should return 400 when handler returns error', async () => {
      req.user.id = 'user-123';
      mockHandler.delete.mockResolvedValue({ error: { message: 'Erro ao excluir usuário' } });
      
      await deleteUser(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao excluir usuário' });
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      await logout(req, res);
      
      expect(mockHandler.logout).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Logout realizado com sucesso.' });
    });

    it('should return 400 when handler returns error', async () => {
      mockHandler.logout.mockResolvedValue({ error: { message: 'Erro ao fazer logout' } });
      
      await logout(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao fazer logout' });
    });
  });

  describe('verifyToken', () => {
    it('should verify token successfully', async () => {
      req.headers = { authorization: 'Bearer valid-token' };
      
      await verifyToken(req, res);
      
      expect(mockHandler.verifyToken).toHaveBeenCalledWith('valid-token');
      expect(res.json).toHaveBeenCalledWith({
        user: { id: 'user-123', email: 'test@test.com', name: 'Test User', phone: '123456789', role: 'USER' }
      });
    });

    it('should return 401 when token is not provided', async () => {
      req.headers = {};
      
      await verifyToken(req, res);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Token não fornecido.' });
      expect(mockHandler.verifyToken).not.toHaveBeenCalled();
    });

    it('should return 401 when token is invalid', async () => {
      req.headers = { authorization: 'Bearer invalid-token' };
      mockHandler.verifyToken.mockResolvedValue({ error: { message: 'Token inválido ou expirado.' } });
      
      await verifyToken(req, res);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido ou expirado.' });
    });

    it('should return 400 when handler throws error', async () => {
      req.headers = { authorization: 'Bearer valid-token' };
      mockHandler.verifyToken.mockRejectedValue(new Error('JWT error'));
      
      await verifyToken(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'JWT error' });
    });
  });
});
import { AuthHandler } from "../handler";
import { db } from "@/config/db";
import bcrypt from "bcryptjs";

// Mock do banco de dados
jest.mock("@/config/db", () => ({
  db: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));
jest.mock("@/utils/jwt", () => ({
  JWTUtils: {
    generateToken: jest.fn(() => "jwt-token-123"),
    verifyToken: jest.fn((token: string) => {
      if (token === "valid-token") return { userId: "user123", email: "test@example.com", role: "USER" };
      return null;
    }),
  },
}));

// Mock do JWTUtils
const mockJWTUtils = {
  generateToken: jest.fn(),
  verifyToken: jest.fn(),
};


// Mock do bcrypt
jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe("Manipulador de Autenticação", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("AuthHandler.signUp", () => {
    it("deve criar usuário com sucesso", async () => {
      // Mock para verificação de email duplicado (deve retornar null para permitir criação)
      (db.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Mock para hash da senha
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword123");

      // Mock para criação do usuário
      const mockUser = {
        id: "user123",
        email: "test@example.com",
        password: "hashedPassword123",
        name: "Test User",
        phone: "11999999999",
        role: "USER",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (db.user.create as jest.Mock).mockResolvedValue(mockUser);

      // Mock para geração do token
      mockJWTUtils.generateToken.mockReturnValue("jwt-token-123");

      const signUpInput = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
        phone: "11999999999",
      };

      const result = await AuthHandler.signUp(signUpInput);
      
      expect(result.user).toBeDefined();
      expect(result.token).toBe("jwt-token-123");
      expect(result.error).toBeUndefined();
      expect(result.user.id).toBe("user123");
      expect(result.user.email).toBe("test@example.com");
      expect(result.user.name).toBe("Test User");
      expect(result.user.phone).toBe("11999999999");
      expect(result.user.password).toBeUndefined(); // Senha não deve estar no retorno
    });

    it("deve retornar erro quando email já existe", async () => {
      // Mock para verificação de email duplicado (retorna usuário existente)
      (db.user.findUnique as jest.Mock).mockResolvedValue({
        id: "existing-user",
        email: "existing@example.com",
      });

      const signUpInput = {
        email: "existing@example.com",
        password: "password123",
        name: "Test User",
        phone: "11999999999",
      };

      const result = await AuthHandler.signUp(signUpInput);
      
      expect(result.error).toBeDefined();
      expect(result.error.message).toBe("Já existe um usuário com este email.");
      expect(result.user).toBeUndefined();
    });

    it("deve executar signUp básico", async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword123");
      
      const mockUser = {
        id: "user123",
        email: "test@example.com",
        password: "hashedPassword123",
        name: "Test User",
        phone: "11999999999",
        role: "USER",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (db.user.create as jest.Mock).mockResolvedValue(mockUser);
      mockJWTUtils.generateToken.mockReturnValue("jwt-token-123");

      const signUpInput = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
        phone: "11999999999",
      };

      const result = await AuthHandler.signUp(signUpInput);
      expect(result).toBeDefined();
    });
  });

  describe("AuthHandler.login", () => {
    it("deve fazer login com sucesso", async () => {
      const mockUser = {
        id: "user123",
        email: "test@example.com",
        password: "hashedPassword123",
        name: "Test User",
        phone: "11999999999",
        role: "USER",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (db.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      
      mockJWTUtils.generateToken.mockReturnValue("jwt-token-123");

      const loginInput = {
        email: "test@example.com",
        password: "password123",
      };

      const result = await AuthHandler.login(loginInput);
      
      expect(result.user).toBeDefined();
      expect(result.token).toBe("jwt-token-123");
      expect(result.error).toBeUndefined();
      expect(result.user.id).toBe("user123");
      expect(result.user.email).toBe("test@example.com");
      expect(result.user.password).toBeUndefined(); // Senha não deve estar no retorno
    });

    it("deve retornar erro quando usuário não existe", async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue(null);

      const loginInput = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      const result = await AuthHandler.login(loginInput);
      
      expect(result.error).toBeDefined();
      expect(result.error.message).toBe("Usuário não encontrado.");
      expect(result.user).toBeUndefined();
    });

    it("deve retornar erro quando senha está incorreta", async () => {
      const mockUser = {
        id: "user123",
        email: "test@example.com",
        password: "hashedPassword123",
        name: "Test User",
        phone: "11999999999",
        role: "USER",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (db.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const loginInput = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      const result = await AuthHandler.login(loginInput);
      
      expect(result.error).toBeDefined();
      expect(result.error.message).toBe("Senha inválida.");
      expect(result.user).toBeUndefined();
    });
  });

  describe("AuthHandler.getProfile", () => {
    it("deve buscar perfil do usuário", async () => {
      const mockUser = {
        id: "user123",
        email: "test@example.com",
        password: "hashedPassword123",
        name: "Test User",
        phone: "11999999999",
        role: "USER",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (db.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await AuthHandler.getProfile("user123");
      
      expect(result.user).toBeDefined();
      expect(result.error).toBeUndefined();
      expect(result.user.id).toBe("user123");
      expect(result.user.name).toBe("Test User");
      expect(result.user.email).toBe("test@example.com");
      expect(result.user.password).toBeUndefined(); // Senha não deve estar no retorno
    });

    it("deve retornar erro quando usuário não existe", async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await AuthHandler.getProfile("nonexistent");
      
      expect(result.error).toBeDefined();
      expect(result.error.message).toBe("Usuário não encontrado.");
      expect(result.user).toBeUndefined();
    });
  });

  describe("AuthHandler.updateProfile", () => {
    it("deve atualizar perfil do usuário", async () => {
      const mockUser = {
        id: "user123",
        email: "test@example.com",
        password: "hashedPassword123",
        name: "Test User",
        phone: "11999999999",
        role: "USER",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUpdatedUser = {
        ...mockUser,
        name: "Updated Name",
        phone: "11888888888",
        updatedAt: new Date(),
      };

      (db.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (db.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

      const updateInput = {
        name: "Updated Name",
        phone: "11888888888",
      };

      const result = await AuthHandler.updateProfile("user123", updateInput);
      
      expect(result.user).toBeDefined();
      expect(result.error).toBeUndefined();
      expect(result.user.id).toBe("user123");
      expect(result.user.name).toBe("Updated Name");
      expect(result.user.phone).toBe("11888888888");
      expect(result.user.password).toBeUndefined(); // Senha não deve estar no retorno
    });

    it("deve retornar erro quando usuário não existe", async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue(null);

      const updateInput = {
        name: "Updated Name",
        phone: "11888888888",
      };

      const result = await AuthHandler.updateProfile("nonexistent", updateInput);
      
      expect(result.error).toBeDefined();
      expect(result.error.message).toBe("Usuário não encontrado.");
      expect(result.user).toBeUndefined();
    });
  });

  describe("AuthHandler.delete", () => {
    it("deve deletar usuário com sucesso", async () => {
      const mockUser = {
        id: "user123",
        email: "test@example.com",
        password: "hashedPassword123",
        name: "Test User",
        phone: "11999999999",
        role: "USER",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (db.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (db.user.delete as jest.Mock).mockResolvedValue(mockUser);

      const result = await AuthHandler.delete("user123");
      
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("deve retornar erro quando usuário não existe", async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await AuthHandler.delete("nonexistent");
      
      expect(result.error).toBeDefined();
      expect(result.error.message).toBe("Usuário não encontrado.");
      expect(result.success).toBeUndefined();
    });
  });

  describe("AuthHandler.logout", () => {
    it("deve fazer logout com sucesso", async () => {
      const result = await AuthHandler.logout();
      
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe("AuthHandler.verifyToken", () => {
    it("deve verificar token válido com sucesso", async () => {
      const mockPayload = {
        userId: "user123",
        email: "test@example.com",
        role: "USER",
      };

      const mockUser = {
        id: "user123",
        email: "test@example.com",
        password: "hashedPassword123",
        name: "Test User",
        phone: "11999999999",
        role: "USER",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockJWTUtils.verifyToken.mockReturnValue(mockPayload);
      (db.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await AuthHandler.verifyToken("valid-token");
      
      expect(result.user).toBeDefined();
      expect(result.error).toBeUndefined();
      expect(result.user.id).toBe("user123");
      expect(result.user.email).toBe("test@example.com");
      expect(result.user.password).toBeUndefined(); // Senha não deve estar no retorno
    });

    it("deve retornar erro quando token é inválido", async () => {
      mockJWTUtils.verifyToken.mockReturnValue(null);

      const result = await AuthHandler.verifyToken("invalid-token");
      
      expect(result.error).toBeDefined();
      expect(result.error.message).toBe("Token inválido ou expirado.");
      expect(result.user).toBeUndefined();
    });

    it("deve retornar erro quando usuário não existe", async () => {
      const mockPayload = {
        userId: "nonexistent",
        email: "test@example.com",
        role: "USER",
      };

      mockJWTUtils.verifyToken.mockReturnValue(mockPayload);
      (db.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await AuthHandler.verifyToken("valid-token");
      
      expect(result.error).toBeDefined();
      expect(result.error.message).toBe("Usuário não encontrado.");
      expect(result.user).toBeUndefined();
    });
  });
});
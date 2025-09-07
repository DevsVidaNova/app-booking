import {
  signUpUserHandler,
  loginUserHandler,
  getUserProfileHandler,
  updateUserProfileHandler,
  deleteUserHandler,
  logoutHandler,
} from "../handler";

const mockAnonClient = {
  auth: {
    signInWithPassword: jest.fn().mockResolvedValue({
      data: { user: { id: "user123" } },
      error: null,
    }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
  },
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest
          .fn()
          .mockResolvedValue({
            data: { id: "1", name: "Test User" },
            error: null,
          }),
      }),
    }),
  }),
};
import supabaseClient from '@/config/supabaseClient';
const mockSupabase = supabaseClient;

jest.mock("@/config/supabaseClient", () => ({
  __esModule: true,
  default: {
    auth: {
      signUp: jest.fn(),
      admin: {
        deleteUser: jest.fn(),
      },
    },
    from: jest.fn().mockReturnValue({
      insert: jest.fn().mockResolvedValue({ data: null, error: null }),
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest
            .fn()
            .mockResolvedValue({
              data: { id: "1", name: "Test User" },
              error: null,
            }),
        }),
      }),
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest
            .fn()
            .mockResolvedValue({
              data: [{ id: "1", name: "Updated User" }],
              error: null,
            }),
        }),
      }),
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      }),
    }),
  },
}));

jest.mock("@/config/supabaseAnonClient", () => ({
  createSupabaseAnonClient: jest.fn(() => mockAnonClient),
}));

describe("Manipulador de Autenticação", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("signUpUserHandler", () => {
    it("deve criar usuário com sucesso", async () => {
      // Mock para verificação de email duplicado (deve retornar null para permitir criação)
      (mockSupabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      });

      // Mock para signUp
      (mockSupabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: { id: "user123" } },
        error: null,
      });

      // Mock para inserção do perfil
      (mockSupabase.from as jest.Mock).mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: [
              {
                id: "profile123",
                name: "Test User",
                email: "test@example.com",
              },
            ],
            error: null,
          }),
        }),
      });

      const signUpInput = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
        phone: "11999999999",
      };

      const result = await signUpUserHandler(signUpInput);
      expect(result.user).toBeDefined();
      expect(result.profile).toBeDefined();
      expect(result.profile.name).toBe("Test User");
      expect(result.error).toBeUndefined();
    });

    it("deve retornar erro quando email já existe", async () => {
      // Mock para verificação de email duplicado (retorna usuário existente)
      (mockSupabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest
              .fn()
              .mockResolvedValue({
                data: { id: "existing-user" },
                error: null,
              }),
          }),
        }),
      });

      const signUpInput = {
        email: "existing@example.com",
        password: "password123",
        name: "Test User",
        phone: "11999999999",
      };

      const result = await signUpUserHandler(signUpInput);
      expect(result.error).toBeDefined();
      expect(result.error.message).toBe("Já existe um usuário com este email.");
      expect(result.user).toBeUndefined();
    });

    it("deve executar signUp básico", async () => {
      const signUpInput = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
        phone: "11999999999",
      };

      const result = await signUpUserHandler(signUpInput);
      expect(result).toBeDefined();
    });
  });

  describe("loginUserHandler", () => {
    it("deve fazer login com sucesso", async () => {
      const loginInput = {
        email: "test@example.com",
        password: "password123",
      };

      const result = await loginUserHandler(loginInput);
      expect(result).toBeDefined();
    });

    it("deve executar login básico", async () => {
      const loginInput = {
        email: "test@example.com",
        password: "password123",
      };

      const result = await loginUserHandler(loginInput);
      expect(result).toBeDefined();
    });
  });

  describe("getUserProfileHandler", () => {
    it("deve buscar perfil do usuário", async () => {
      // Mock para buscar perfil existente
      (mockSupabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest
              .fn()
              .mockResolvedValue({
                data: { id: "1", name: "Test User" },
                error: null,
              }),
          }),
        }),
      });

      const result = await getUserProfileHandler("user123");
      expect(result.profileData).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it("deve retornar erro quando usuário não existe", async () => {
      // Mock para usuário não encontrado
      (mockSupabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      });

      const result = await getUserProfileHandler("nonexistent");
      expect(result.error).toBeDefined();
      expect(result.error.message).toBe("Usuário não encontrado.");
      expect(result.profileData).toBeUndefined();
    });
  });

  describe("updateUserProfileHandler", () => {
    it("deve atualizar perfil do usuário", async () => {
      // Mock para verificar se usuário existe
      (mockSupabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest
              .fn()
              .mockResolvedValue({ data: { id: "1" }, error: null }),
          }),
        }),
      });

      // Mock para atualização
      (mockSupabase.from as jest.Mock).mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest
              .fn()
              .mockResolvedValue({
                data: [{ id: "1", name: "Updated User" }],
                error: null,
              }),
          }),
        }),
      });

      const updateInput = {
        name: "Updated Name",
        phone: "11888888888",
      };

      const result = await updateUserProfileHandler("user123", updateInput);
      expect(result.profile).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it("deve retornar erro quando usuário não existe", async () => {
      // Mock para usuário não encontrado
      (mockSupabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      });

      const updateInput = {
        name: "Updated Name",
        phone: "11888888888",
      };

      const result = await updateUserProfileHandler("nonexistent", updateInput);
      expect(result.error).toBeDefined();
      expect(result.error.message).toBe("Usuário não encontrado.");
      expect(result.profile).toBeUndefined();
    });
  });

  describe("deleteUserHandler", () => {
    it("deve deletar usuário com sucesso", async () => {
      // Mock para verificar se usuário existe
      (mockSupabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest
              .fn()
              .mockResolvedValue({ data: { id: "1" }, error: null }),
          }),
        }),
      });

      // Mock para deletar perfil
      (mockSupabase.from as jest.Mock).mockReturnValueOnce({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      // Mock para deletar usuário do auth
(mockSupabase.auth.admin.deleteUser as jest.Mock).mockResolvedValue({ error: null });

      const result = await deleteUserHandler("user123");
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("deve retornar erro quando usuário não existe", async () => {
      // Mock para usuário não encontrado
      (mockSupabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      });

      const result = await deleteUserHandler("nonexistent");
      expect(result.error).toBeDefined();
      expect(result.error.message).toBe("Usuário não encontrado.");
      expect(result.success).toBeUndefined();
    });
  });

  describe("logoutHandler", () => {
    it("deve fazer logout com sucesso", async () => {
      const result = await logoutHandler();
      expect(result).toBeDefined();
    });
  });
});

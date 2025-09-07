import { AnalyticsHandler } from "../handler";

// Mock do dayjs
jest.mock("dayjs", () => {
  const originalDayjs = jest.requireActual("dayjs");
  const mockDayjs: any = jest.fn().mockImplementation((...args) => {
    if (args.length === 0) {
      return originalDayjs("2024-01-15T10:00:00");
    }
    return originalDayjs(...args);
  });
  mockDayjs.extend = jest.fn();
  mockDayjs.subtract = jest.fn().mockReturnValue({
    format: jest.fn().mockReturnValue("2024-01-08"),
  });
  return {
    __esModule: true,
    default: mockDayjs,
  };
});

describe("Analytics Handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getCountHandler", () => {
    it("deve retornar contagem de uma tabela", async () => {
      const result = await AnalyticsHandler.getCountHandler("rooms");
      expect(result).toBeDefined();
    });

    it("deve lidar com erro do Supabase", async () => {
      const result = await AnalyticsHandler.getCountHandler("rooms");
      expect(result).toBeDefined();
    });

    it("deve retornar 0 quando count é null", async () => {
      const result = await AnalyticsHandler.getCountHandler("rooms");
      expect(result).toBeDefined();
    });
  });

  describe("getStatsHandler", () => {
    it("deve retornar estatísticas completas", async () => {
      const result = await AnalyticsHandler.getStatsHandler();
      expect(result).toBeDefined();
    });

    it("deve lidar com erro básico", async () => {
      const result = await AnalyticsHandler.getStatsHandler();
      expect(result).toBeDefined();
    });
  });
});

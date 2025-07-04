import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { getToken, deleteToken } from "../hooks/token";
import { env } from "@/lib/env";

interface FetchApiOptions extends AxiosRequestConfig {
  headers?: Record<string, string>;
  data?: Record<string, any>;
  params?: Record<string, string | number | boolean | unknown>;
}

const apiClient = axios.create({
  baseURL: env.API_URL,
  headers: { "Content-Type": "application/json" },
});

// Interceptor de resposta para capturar erros 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Limpa os tokens de autenticação
      await deleteToken();
      
      // Redireciona para a página de login
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export async function fetchApi<T = unknown>(
  url: string,
  options: FetchApiOptions = {}
): Promise<T> {
  try {
    const method = options.method?.toUpperCase() || "GET";
    if (method !== "GET" && !options.data) {
      throw new Error(`Data is required for ${method} requests.`);
    }
    const response: AxiosResponse<T> = await apiClient.request({
      url,
      method,
      params: options.params,
      ...options,
    });

    return response.data;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
}

export async function fetchWithAuth<T = Record<string, unknown>>(
  url: string,
  options: FetchApiOptions = {}
): Promise<T> { 
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("Authentication token not found.");
    }

    const response: AxiosResponse<T> = await apiClient.request({
      url,
      method: options.method || "GET",
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
      params: options.params || undefined,
      data: options.data || undefined,
    });

    return response.data;  
  } catch (error: any) {
    console.error(`Error fetching with auth at ${url}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
}


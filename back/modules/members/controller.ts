import { z } from 'zod';
import { 
  createMemberHandler,
  getMembersHandler,
  getMemberByIdHandler,
  updateMemberHandler,
  deleteMemberHandler,
  searchMemberHandler,
  searchByFilterHandler,
  getAnalyticsHandler,
} from "./handler";
import {
  createMemberSchema,
  updateMemberSchema,
  getMembersSchema,
  searchMemberSchema,
  searchByFilterSchema,
  idSchema,
} from "./schemas";

// Função auxiliar para lidar com erros de validação
function handleValidationError(error: z.ZodError, res: any) {
  const firstError = error.errors[0];
  return res.status(400).json({ error: firstError.message });
}

// 📌 1. Criar um novo membro
export async function createMember(req: any, res: any) {
  try {
    const validatedData = createMemberSchema.parse(req.body);
    const result = await createMemberHandler(validatedData);
    
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    
    res.status(201).json(result.data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleValidationError(error, res);
    }
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}

// 📌 2. Listar todos os membros
export async function getMembers(req: any, res: any) {
  try {
    const queryParams = {
      page: req.query.page ? parseInt(req.query.page) : 1,
      limit: req.query.limit ? parseInt(req.query.limit) : 10
    };
    
    const validatedParams = getMembersSchema.parse(queryParams);
    const result = await getMembersHandler(validatedParams);
    
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleValidationError(error, res);
    }
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}

// 📌 3. Buscar um membro por ID
export async function getMemberById(req: any, res: any) {
  try {
    const validatedId = idSchema.parse(req.params.id);
    const result = await getMemberByIdHandler(validatedId);
    
    if (result.error) {
      return res.status(404).json({ error: result.error });
    }
    
    res.json(result.data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleValidationError(error, res);
    }
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}

// 📌 4. Atualizar um membro
export async function updateMember(req: any, res: any) {
  try {
    //const validatedId = idSchema.parse(req.params.id);
    const validatedData = updateMemberSchema.parse(req.body);
    
    const result = await updateMemberHandler(req.params.id, validatedData);
    
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    
    res.json(result.data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleValidationError(error, res);
    }
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}

// 📌 5. Deletar um membro
export async function deleteMember(req: any, res: any) {
  try {
    const validatedId = idSchema.parse(req.params.id);
    const result = await deleteMemberHandler(validatedId);
    
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    
    res.json(result.data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleValidationError(error, res);
    }
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}

// 📌 6. Pesquisar membro pelo nome
export async function searchMember(req: any, res: any) {
  try {
    const validatedData = searchMemberSchema.parse(req.body);
    const result = await searchMemberHandler(validatedData.full_name);
    
    if (result.error) {
      return res.status(404).json({ error: result.error });
    }
    
    res.json(result.data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleValidationError(error, res);
    }
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}

// 📌 7. Buscar com filtros genéricos
export async function searchByFilter(req: any, res: any) {
  try {
    const validatedData = searchByFilterSchema.parse(req.body);
    const result = await searchByFilterHandler(validatedData);
    
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    
    res.json(result.data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleValidationError(error, res);
    }
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}

// 📌 8. Listar estatísticas
export async function getAnalytics(_req: any, res: any) {
  try {
    const result = await getAnalyticsHandler();
    
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }
    
    res.json(result.data);
  } catch (error) {
    res.status(500).json({ error: error || 'Erro interno do servidor.' });
  }
}


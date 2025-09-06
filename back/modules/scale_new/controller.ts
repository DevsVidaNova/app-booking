import {
  ScaleHandler,
} from "./handler";
import {
  createScaleSchema,
  updateScaleSchema,
  searchScaleSchema,
  idParamSchema,
  paginationQuerySchema,
  CreateScaleInput,
  UpdateScaleInput,
  SearchScaleInput,
  IdParam,
  PaginationQuery
} from "./schemas";

export async function createScale(req: any, res: any) {
  try {
    const input: CreateScaleInput = createScaleSchema.parse(req.body);
    const result = await ScaleHandler.create(input);

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    res.status(201).json({ message: "Escala criada com sucesso." });
  } catch (error: any) {
    if (error.errors) {
      return res.status(400).json({
        error: "Dados inválidos",
        details: error.errors.map((err: any) => err.message)
      });
    }
    return res.status(400).json({ error: error.message });
  }
}

export async function getScales(req: any, res: any) {
  try {
    const { page, pageSize }: PaginationQuery = paginationQuerySchema.parse(req.query);
    const result = await ScaleHandler.list({ page, pageSize });

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    res.status(200).json(result.data);
  } catch (error: any) {
    if (error.errors) {
      return res.status(400).json({
        error: "Parâmetros de consulta inválidos",
        details: error.errors.map((err: any) => err.message)
      });
    }
    return res.status(400).json({ error: error.message });
  }
}

export async function getScaleById(req: any, res: any) {
  try {
    const { id }: IdParam = idParamSchema.parse(req.params);
    const result = await ScaleHandler.single(id);

    if (result.error) {
      return res.status(404).json({ error: result.error });
    }
    res.status(200).json(result.data);
  } catch (error: any) {
    if (error.errors) {
      return res.status(400).json({
        error: "Parâmetros inválidos",
        details: error.errors.map((err: any) => err.message)
      });
    }
    return res.status(400).json({ error: error.message });
  }
}

export async function updateScale(req: any, res: any) {
  try {
    const { id }: IdParam = idParamSchema.parse(req.params);
    const updates: UpdateScaleInput = updateScaleSchema.parse(req.body);

    const result = await ScaleHandler.update(id, updates);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    res.status(200).json({ message: "Escala atualizada com sucesso." });
  } catch (error: any) {
    if (error.errors) {
      return res.status(400).json({
        error: "Dados inválidos",
        details: error.errors.map((err: any) => err.message)
      });
    }
    return res.status(400).json({ error: error.message });
  }
}

export async function deleteScale(req: any, res: any) {
  try {
    const { id }: IdParam = idParamSchema.parse(req.params);
    const result = await ScaleHandler.delete(id);

    if (result.error) {
      return res.status(404).json({ error: result.error });
    }
    res.status(200).json({ message: "Escala excluída com sucesso." });
  } catch (error: any) {
    if (error.errors) {
      return res.status(400).json({
        error: "Parâmetros inválidos",
        details: error.errors.map((err: any) => err.message)
      });
    }
    return res.status(400).json({ error: error.message });
  }
}

export async function searchScale(req: any, res: any) {
  try {
    const { name }: SearchScaleInput = searchScaleSchema.parse(req.body);
    const result = await ScaleHandler.search(name);

    if (result.error) {
      return res.status(404).json({ error: result.error });
    }
    res.json(result.data);
  } catch (error: any) {
    if (error.errors) {
      return res.status(400).json({
        error: "Dados de busca inválidos",
        details: error.errors.map((err: any) => err.message)
      });
    }
    return res.status(400).json({ error: error.message });
  }
}

export async function duplicateScale(req: any, res: any) {
  try {
    const { id }: IdParam = idParamSchema.parse(req.params);
    const result = await ScaleHandler.duplicate(id);

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    res.status(201).json(result.data);
  } catch (error: any) {
    if (error.errors) {
      return res.status(400).json({
        error: "Parâmetros inválidos",
        details: error.errors.map((err: any) => err.message)
      });
    }
    return res.status(400).json({ error: error.message });
  }
}

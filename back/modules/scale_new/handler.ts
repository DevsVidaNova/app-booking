import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import { db } from "@/config/db";
import { ScaleInput, Scale } from "./types";

dayjs.extend(customParseFormat);

// Função auxiliar para converter null para undefined
const convertNullToUndefined = (obj: any): any => {
  if (obj === null) return undefined;
  if (Array.isArray(obj)) return obj.map(convertNullToUndefined);
  if (typeof obj === 'object' && obj !== null) {
    const converted: any = {};
    for (const key in obj) {
      converted[key] = convertNullToUndefined(obj[key]);
    }
    return converted;
  }
  return obj;
};

export interface HandlerResult<T> {
  data?: T;
  error?: string;
}

export const ScaleHandler = {
  async create(input: ScaleInput): Promise<HandlerResult<null>> {
    try {
      const formattedDate = dayjs(input.date, 'DD/MM/YYYY').format('YYYY-MM-DD');
      if (!dayjs(formattedDate).isValid()) {
        return { error: "Data inválida." };
      }

      const existingScale = await db.scale.findFirst({
        where: { name: input.name }
      });

      if (existingScale) {
        return { error: "Já existe uma escala com este nome." };
      }

      await db.scale.create({
        data: {
          date: new Date(formattedDate),
          name: input.name,
          description: input.description,
          direction: input.direction,
          band: input.band,
          projection: input.projection,
          light: input.light,
          transmission: input.transmission,
          camera: input.camera,
          live: input.live,
          sound: input.sound,
          trainingSound: input.training_sound,
          photography: input.photography,
          stories: input.stories,
          dynamic: input.dynamic
        }
      });

      return { data: null };
    } catch {
      return { error: "Erro ao criar escala." };
    }
  },

  async list(params: GetScalesParams): Promise<HandlerResult<GetScalesResult>> {
    try {
      const page = params.page || 1;
      const pageSize = params.pageSize || 15;
      const skip = (page - 1) * pageSize;

      const [scales, total] = await Promise.all([
        db.scale.findMany({
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' }
        }),
        db.scale.count()
      ]);

      const formattedScales = scales.map(scale => ({
        id: scale.id,
        date: dayjs(scale.date).format('DD/MM/YYYY'),
        name: scale.name,
        description: scale.description,
        direction: scale.direction,
        band: scale.band,
        projection: scale.projection,
        light: scale.light,
        transmission: scale.transmission,
        camera: scale.camera,
        live: scale.live,
        sound: scale.sound,
        training_sound: scale.trainingSound,
        photography: scale.photography,
        stories: scale.stories,
        dynamic: scale.dynamic
      }));

      return {
        data: {
          scales: convertNullToUndefined(formattedScales),
          pagination: {
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
          },
        },
      };
    } catch {
      return { error: "Erro ao listar escalas." };
    }
  },

  async single(id: string): Promise<HandlerResult<Scale>> {
    try {
      const scale = await db.scale.findUnique({
        where: { id }
      });

      if (!scale) {
        return { error: "Escala não encontrada." };
      }

      const formattedScale = {
        id: scale.id,
        date: dayjs(scale.date).format('DD/MM/YYYY'),
        name: scale.name,
        description: scale.description,
        direction: scale.direction,
        band: scale.band,
        projection: scale.projection,
        light: scale.light,
        transmission: scale.transmission,
        camera: scale.camera,
        live: scale.live,
        sound: scale.sound,
        training_sound: scale.trainingSound,
        photography: scale.photography,
        stories: scale.stories,
        dynamic: scale.dynamic
      };

      return { data: convertNullToUndefined(formattedScale) };
    } catch {
      return { error: "Erro ao buscar escala." };
    }
  },

  async update(id: string, updates: Partial<ScaleInput>): Promise<HandlerResult<null>> {
    try {
      // Verificar se a escala existe
      const existingScale = await db.scale.findUnique({
        where: { id }
      });

      if (!existingScale) {
        return { error: "Escala não encontrada." };
      }

      // Se está atualizando o nome, verificar se não há duplicata
      if (updates.name) {
        const duplicateScale = await db.scale.findFirst({
          where: {
            name: updates.name,
            id: { not: id }
          }
        });

        if (duplicateScale) {
          return { error: "Já existe uma escala com este nome." };
        }
      }

      const updateData: any = {};

      if (updates.name) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.direction) updateData.direction = updates.direction;
      if (updates.band !== undefined) updateData.band = updates.band;
      if (updates.projection !== undefined) updateData.projection = updates.projection;
      if (updates.light !== undefined) updateData.light = updates.light;
      if (updates.transmission !== undefined) updateData.transmission = updates.transmission;
      if (updates.camera !== undefined) updateData.camera = updates.camera;
      if (updates.live !== undefined) updateData.live = updates.live;
      if (updates.sound !== undefined) updateData.sound = updates.sound;
      if (updates.training_sound !== undefined) updateData.trainingSound = updates.training_sound;
      if (updates.photography !== undefined) updateData.photography = updates.photography;
      if (updates.stories !== undefined) updateData.stories = updates.stories;
      if (updates.dynamic !== undefined) updateData.dynamic = updates.dynamic;

      if (updates.date) {
        const formattedDate = dayjs(updates.date, 'DD/MM/YYYY').format('YYYY-MM-DD');
        updateData.date = new Date(formattedDate);
      }

      await db.scale.update({
        where: { id },
        data: updateData
      });

      return { data: null };
    } catch {
      return { error: "Erro ao atualizar escala." };
    }
  },

  async delete(id: string): Promise<HandlerResult<null>> {
    try {
      // Verificar se a escala existe antes de tentar deletar
      const existingScale = await db.scale.findUnique({
        where: { id }
      });

      if (!existingScale) {
        return { error: "Escala não encontrada." };
      }

      await db.scale.delete({
        where: { id }
      });

      return { data: null };
    } catch {
      return { error: "Erro ao excluir escala." };
    }
  },

  async search(name: string): Promise<HandlerResult<Scale[]>> {
    try {
      if (!name || name.trim() === "") {
        return { error: "Nome para busca não pode estar vazio." };
      }

      const scales = await db.scale.findMany({
        where: {
          name: {
            contains: name,
            mode: 'insensitive'
          }
        }
      });

      const formattedScales = scales.map(scale => ({
        id: scale.id,
        date: dayjs(scale.date).format('DD/MM/YYYY'),
        name: scale.name,
        description: scale.description,
        direction: scale.direction,
        band: scale.band,
        projection: scale.projection,
        light: scale.light,
        transmission: scale.transmission,
        camera: scale.camera,
        live: scale.live,
        sound: scale.sound,
        training_sound: scale.trainingSound,
        photography: scale.photography,
        stories: scale.stories,
        dynamic: scale.dynamic
      }));

      return { data: convertNullToUndefined(formattedScales) };
    } catch {
      return { error: "Erro ao buscar escala." };
    }
  },

  async duplicate(id: string): Promise<HandlerResult<Scale>> {
    try {
      const originalScale = await db.scale.findUnique({
        where: { id }
      });

      if (!originalScale) {
        return { error: "Escala não encontrada." };
      }

      const duplicatedScale = await db.scale.create({
        data: {
          name: originalScale.name + " (duplicado)",
          description: originalScale.description,
          direction: originalScale.direction,
          band: originalScale.band,
          projection: originalScale.projection,
          light: originalScale.light,
          transmission: originalScale.transmission,
          camera: originalScale.camera,
          live: originalScale.live,
          sound: originalScale.sound,
          trainingSound: originalScale.trainingSound,
          photography: originalScale.photography,
          stories: originalScale.stories,
          dynamic: originalScale.dynamic,
          date: originalScale.date
        }
      });

      const formattedScale = {
        id: duplicatedScale.id,
        date: dayjs(duplicatedScale.date).format('DD/MM/YYYY'),
        name: duplicatedScale.name,
        description: duplicatedScale.description,
        direction: duplicatedScale.direction,
        band: duplicatedScale.band,
        projection: duplicatedScale.projection,
        light: duplicatedScale.light,
        transmission: duplicatedScale.transmission,
        camera: duplicatedScale.camera,
        live: duplicatedScale.live,
        sound: duplicatedScale.sound,
        training_sound: duplicatedScale.trainingSound,
        photography: duplicatedScale.photography,
        stories: duplicatedScale.stories,
        dynamic: duplicatedScale.dynamic
      };

      return { data: convertNullToUndefined(formattedScale) };
    } catch {
      return { error: "Erro ao duplicar escala." };
    }
  }

}


export interface GetScalesParams {
  page?: number;
  pageSize?: number;
}

export interface GetScalesResult {
  scales: Scale[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}





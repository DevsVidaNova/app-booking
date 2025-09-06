import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { db } from "@/config/db";
import translateError, { DatabaseError } from "@/utils/errors";
import {
  MemberData,
  Member,
  HandlerResult,
  GetMembersParams,
  SearchByFilterParams,
  AnalyticsResult,
  ALLOWED_SEARCH_FIELDS,
  CHART_COLORS
} from "./types";

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

export const MemberHandler = {
  async create(memberData: MemberData): Promise<HandlerResult<Member>> {
    const { full_name, birth_date, gender, cpf, rg, phone, email, street, number, neighborhood, city, state, cep, mother_name, father_name, marital_status, has_children, children_count } = memberData;

    if (!full_name || !birth_date || !gender || !phone || !email) {
      return { error: "Campos obrigatórios ausentes." };
    }

    const formattedBirthDate = dayjs(birth_date, "DD/MM/YYYY").format("YYYY-MM-DD");

    try {
      const data = await db.member.create({
        data: {
          fullName: full_name,
          birthDate: formattedBirthDate,
          gender,
          cpf,
          rg,
          phone,
          email,
          street,
          number,
          neighborhood,
          city,
          state,
          cep,
          motherName: mother_name,
          fatherName: father_name,
          maritalStatus: marital_status,
          hasChildren: has_children,
          childrenCount: children_count
        }
      });

      const formattedData = {
        ...data,
        full_name: data.fullName,
        birth_date: dayjs(data.birthDate).format("DD/MM/YYYY"),
        mother_name: data.motherName,
        father_name: data.fatherName,
        marital_status: data.maritalStatus,
        has_children: data.hasChildren,
        children_count: data.childrenCount
      };

      return { data: convertNullToUndefined(formattedData) };
    } catch (err) {
      return { error: translateError(err as DatabaseError) };
    }
  },

  async list({ page = 1, limit = 10 }: GetMembersParams): Promise<any> {
    try {
      const skip = (page - 1) * limit;

      const [data, count] = await Promise.all([
        db.member.findMany({
          skip,
          take: limit,
          orderBy: { id: 'desc' }
        }),
        db.member.count()
      ]);

      const formattedData = data.map(member => ({
        ...member,
        full_name: member.fullName,
        birth_date: dayjs(member.birthDate).format("DD/MM/YYYY"),
        mother_name: member.motherName,
        father_name: member.fatherName,
        marital_status: member.maritalStatus,
        has_children: member.hasChildren,
        children_count: member.childrenCount
      }));

      const totalPages = Math.ceil(count / limit);

      return {
        data: convertNullToUndefined(formattedData),
        total: count,
        page,
        to: data.length,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      };
    } catch (err) {
      return { error: "" + err || "Erro ao buscar membros." };
    }
  },

  async single(id: number | string): Promise<HandlerResult<Member>> {
    try {
      const data = await db.member.findUnique({
        where: { id: Number(id) }
      });

      if (!data) return { error: "Membro não encontrado." };

      // Formatar data de nascimento para exibição
      const formattedData = {
        ...data,
        full_name: data.fullName,
        birth_date: dayjs(data.birthDate).format("DD/MM/YYYY"),
        mother_name: data.motherName,
        father_name: data.fatherName,
        marital_status: data.maritalStatus,
        has_children: data.hasChildren,
        children_count: data.childrenCount
      };

      return { data: convertNullToUndefined(formattedData) };
    } catch (err) {
      return { error: "" + err || "Erro ao buscar membro." };
    }
  },

  async update(id: number | string, updates: Partial<MemberData>): Promise<HandlerResult<Member>> {
    const prismaUpdates: any = {};

    if (updates.full_name) prismaUpdates.fullName = updates.full_name;
    if (updates.birth_date) {
      const formattedBirthDate = dayjs(updates.birth_date, "DD/MM/YYYY").format("YYYY-MM-DD");
      prismaUpdates.birthDate = formattedBirthDate;
    }
    if (updates.gender) prismaUpdates.gender = updates.gender;
    if (updates.cpf) prismaUpdates.cpf = updates.cpf;
    if (updates.rg) prismaUpdates.rg = updates.rg;
    if (updates.phone) prismaUpdates.phone = updates.phone;
    if (updates.email) prismaUpdates.email = updates.email;
    if (updates.street) prismaUpdates.street = updates.street;
    if (updates.number) prismaUpdates.number = updates.number;
    if (updates.neighborhood) prismaUpdates.neighborhood = updates.neighborhood;
    if (updates.city) prismaUpdates.city = updates.city;
    if (updates.state) prismaUpdates.state = updates.state;
    if (updates.cep) prismaUpdates.cep = updates.cep;
    if (updates.mother_name) prismaUpdates.motherName = updates.mother_name;
    if (updates.father_name) prismaUpdates.fatherName = updates.father_name;
    if (updates.marital_status) prismaUpdates.maritalStatus = updates.marital_status;
    if (updates.has_children !== undefined) prismaUpdates.hasChildren = updates.has_children;
    if (updates.children_count !== undefined) prismaUpdates.childrenCount = updates.children_count;

    try {
      const data = await db.member.update({
        where: { id: Number(id) },
        data: prismaUpdates
      });

      const formattedData = {
        ...data,
        full_name: data.fullName,
        birth_date: dayjs(data.birthDate).format("DD/MM/YYYY"),
        mother_name: data.motherName,
        father_name: data.fatherName,
        marital_status: data.maritalStatus,
        has_children: data.hasChildren,
        children_count: data.childrenCount
      };

      return { data: convertNullToUndefined(formattedData) };
    } catch (err) {
      return { error: "" + err || "Erro ao atualizar membro." };
    }
  },

  async delete(id: number | string): Promise<HandlerResult<{ message: string }>> {
    try {
      await db.member.delete({
        where: { id: Number(id) }
      });

      return { data: { message: "Membro deletado com sucesso." } };
    } catch (err) {
      return { error: "" + err || "Erro ao deletar membro." };
    }
  },

  async search(full_name: string): Promise<HandlerResult<Member[]>> {
    if (!full_name || full_name.trim() === "") {
      return { error: "Nome é obrigatório para busca." };
    }

    try {
      const data = await db.member.findMany({
        where: {
          fullName: {
            contains: full_name,
            mode: 'insensitive'
          }
        }
      });

      // Formatar datas de nascimento para exibição
      const formattedData = data.map(member => ({
        ...member,
        full_name: member.fullName,
        birth_date: dayjs(member.birthDate).format("DD/MM/YYYY"),
        mother_name: member.motherName,
        father_name: member.fatherName,
        marital_status: member.maritalStatus,
        has_children: member.hasChildren,
        children_count: member.childrenCount
      }));

      return { data: convertNullToUndefined(formattedData) };
    } catch (err) {
      return { error: "" + err || "Erro ao buscar membro." };
    }
  },

  async searchByFilter({ field, value, operator }: SearchByFilterParams): Promise<HandlerResult<Member[]>> {
    if (!field || value === undefined || !operator) {
      return { error: "Parâmetros inválidos." };
    }

    // Validar campos permitidos para busca
    if (!ALLOWED_SEARCH_FIELDS.includes(field as any)) {
      return { error: "Campo não permitido para busca." };
    }

    try {
      let whereClause: any = {};

      // Mapear campos do frontend para campos do Prisma
      const fieldMapping: Record<string, string> = {
        'full_name': 'fullName',
        'birth_date': 'birthDate',
        'mother_name': 'motherName',
        'father_name': 'fatherName',
        'marital_status': 'maritalStatus',
        'has_children': 'hasChildren',
        'children_count': 'childrenCount'
      };

      const prismaField = fieldMapping[field] || field;

      switch (operator) {
        case "eq":
          whereClause[prismaField] = value;
          break;
        case "neq":
          whereClause[prismaField] = { not: value };
          break;
        case "gt":
          whereClause[prismaField] = { gt: value };
          break;
        case "gte":
          whereClause[prismaField] = { gte: value };
          break;
        case "lt":
          whereClause[prismaField] = { lt: value };
          break;
        case "lte":
          whereClause[prismaField] = { lte: value };
          break;
        case "like":
        case "ilike":
          whereClause[prismaField] = {
            contains: value,
            mode: 'insensitive'
          };
          break;
        default:
          return { error: "Operador inválido." };
      }

      const data = await db.member.findMany({
        where: whereClause
      });

      // Formatar datas de nascimento para exibição
      const formattedData = data.map(member => ({
        ...member,
        full_name: member.fullName,
        birth_date: dayjs(member.birthDate).format("DD/MM/YYYY"),
        mother_name: member.motherName,
        father_name: member.fatherName,
        marital_status: member.maritalStatus,
        has_children: member.hasChildren,
        children_count: member.childrenCount
      }));

      return { data: convertNullToUndefined(formattedData) };
    } catch (err) {
      return { error: "" + err || "Erro ao buscar com filtro." };
    }
  },

  async listAnalytics(): Promise<HandlerResult<AnalyticsResult>> {
    try {
      const members = await db.member.findMany();

      const totalMembers = members.length;

      // Estatísticas por Estado Civil
      const maritalStatusCount = members.reduce((acc: any, member: any) => {
        const status = member.maritalStatus || 'Não informado';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const maritalStatusChart = Object.keys(maritalStatusCount).map((status, index) => ({
        label: status,
        value: maritalStatusCount[status],
        percentage: ((maritalStatusCount[status] / totalMembers) * 100).toFixed(2),
        fill: CHART_COLORS[index % CHART_COLORS.length],
      }));

      // Estatísticas por Gênero
      const genderCount = members.reduce((acc: any, member: any) => {
        acc[member.gender] = (acc[member.gender] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const genderChart = Object.keys(genderCount).map((gender, index) => ({
        label: gender,
        value: genderCount[gender],
        percentage: ((genderCount[gender] / totalMembers) * 100).toFixed(2),
        fill: CHART_COLORS[index % CHART_COLORS.length],
      }));

      // Estatísticas por Quantidade de Filhos
      const childrenCount = members.reduce((acc: any, member: any) => {
        const count = member.childrenCount || 0;
        acc[count] = (acc[count] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      const childrenChart = Object.keys(childrenCount).map((count, index) => ({
        label: `${count} filhos`,
        value: childrenCount[parseInt(count)],
        percentage: ((childrenCount[parseInt(count)] / totalMembers) * 100).toFixed(2),
        fill: CHART_COLORS[index % CHART_COLORS.length],
      }));

      // Estatísticas por Faixa Etária
      const calculateAge = (birthDate: string): number => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const month = today.getMonth();
        if (month < birth.getMonth() || (month === birth.getMonth() && today.getDate() < birth.getDate())) {
          age--;
        }
        return age;
      };

      const ageRanges: Record<string, number> = {
        "18-25": 0,
        "26-35": 0,
        "36-45": 0,
        "46-55": 0,
        "56+": 0,
      };

      members.forEach((member: any) => {
        const age = calculateAge(member.birthDate);
        if (age >= 18 && age <= 25) ageRanges["18-25"]++;
        else if (age >= 26 && age <= 35) ageRanges["26-35"]++;
        else if (age >= 36 && age <= 45) ageRanges["36-45"]++;
        else if (age >= 46 && age <= 55) ageRanges["46-55"]++;
        else if (age >= 56) ageRanges["56+"]++;
      });

      const ageStatistics = Object.keys(ageRanges).map((range) => ({
        label: range,
        value: ageRanges[range],
        percentage: ((ageRanges[range] / totalMembers) * 100).toFixed(2),
        fill: getRandomColor(),
      }));

      // Estatísticas por Região
      const cityCount: Record<string, number> = {};
      const stateCount: Record<string, number> = {};

      members.forEach((member: any) => {
        const { city, state } = member;
        if (city) {
          cityCount[city] = (cityCount[city] || 0) + 1;
        }
        if (state) {
          stateCount[state] = (stateCount[state] || 0) + 1;
        }
      });

      const cityStatistics = Object.keys(cityCount).map((city) => ({
        label: city,
        value: cityCount[city],
        percentage: ((cityCount[city] / totalMembers) * 100).toFixed(2),
        fill: getRandomColor(),
      }));

      const stateStatistics = Object.keys(stateCount).map((state) => ({
        label: state,
        value: stateCount[state],
        percentage: ((stateCount[state] / totalMembers) * 100).toFixed(2),
        fill: getRandomColor(),
      }));

      return {
        data: {
          marital: maritalStatusChart,
          gender: genderChart,
          children: childrenChart,
          age: ageStatistics,
          city: cityStatistics,
          state: stateStatistics,
        }
      };
    } catch (err) {
      return { error: "" + err || "Erro ao buscar estatísticas." };
    }
  }
}

function getRandomColor(): string {
  return CHART_COLORS[Math.floor(Math.random() * CHART_COLORS.length)];
}


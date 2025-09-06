import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


export const db = {
    user: prisma.user,
    booking: prisma.booking,
    room: prisma.room,
    scale: prisma.scale,
    member: prisma.member,
    memberOnScale: prisma.memberOnScale
}

export async function init() {
    try {
        await prisma.$connect();
        console.log("✅ Conectado ao banco de dados com sucesso.");
    } catch (error) {
        console.error("❌ Erro ao conectar ao banco de dados:", error);
        throw error;
    }
}
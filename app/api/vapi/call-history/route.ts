import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const calls = await prisma.callHistory.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(calls);
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar histórico de chamadas' },
      { status: 500 }
    );
  }
} 
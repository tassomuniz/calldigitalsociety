import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const callId = searchParams.get('callId');
  const API_KEY = process.env.VAPI_API_KEY;

  if (!callId) {
    return NextResponse.json({ error: 'Call ID é obrigatório' }, { status: 400 });
  }

  if (!API_KEY) {
    return NextResponse.json({ error: 'API Key não encontrada' }, { status: 500 });
  }

  try {
    console.log(`Buscando status da chamada ${callId} na API Vapi`);
    
    const response = await fetch(`https://api.vapi.ai/call/${callId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    const data = await response.json();
    console.log('Resposta da API Vapi:', data);

    if (!response.ok) {
      console.error('Erro da API Vapi:', data);
      return NextResponse.json(
        { error: data.message || 'Falha ao buscar status da chamada' },
        { status: response.status }
      );
    }

    // Mapeia o status para português
    const statusMap: Record<string, string> = {
      'queued': 'na fila',
      'ringing': 'chamando',
      'in-progress': 'em andamento',
      'completed': 'finalizada',
      'failed': 'falhou',
      'no-answer': 'sem resposta',
      'busy': 'ocupado',
      'ended': 'finalizada'
    };

    return NextResponse.json({
      status: data.status,
      statusText: statusMap[data.status] || data.status,
      duration: data.duration,
      cost: data.cost,
      startedAt: data.startedAt,
      endedAt: data.endedAt,
      endedReason: data.endedReason
    });

  } catch (error) {
    console.error('Erro ao buscar status da chamada:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar status da chamada' },
      { status: 500 }
    );
  }
} 
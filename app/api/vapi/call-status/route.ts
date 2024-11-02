import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';



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

    console.log(`Buscando status da chamada ${callId}`);

    

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

      throw new Error(data.message || 'Falha ao buscar status da chamada');

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



    // Verifica se o registro existe antes de tentar atualizar

    const existingCall = await prisma.callHistory.findUnique({

      where: { id: callId }

    });



    // Se o status for final e o registro existir, atualiza

    if (existingCall && ['completed', 'failed', 'no-answer', 'busy', 'ended'].includes(data.status)) {

      try {

        await prisma.callHistory.update({

          where: { id: callId },

          data: {

            status: data.status,

            duration: data.duration || null,

            cost: data.cost || null,

            endedAt: data.endedAt ? new Date(data.endedAt) : null,

            endedReason: data.endedReason || null

          }

        });

      } catch (updateError) {

        console.error('Erro ao atualizar registro:', updateError);

        // Continua mesmo se falhar a atualização

      }

    }



    // Se o registro não existir e o status for final, cria um novo

    if (!existingCall && ['completed', 'failed', 'no-answer', 'busy', 'ended'].includes(data.status)) {

      try {

        await prisma.callHistory.create({

          data: {

            id: callId,

            customerName: data.assistantOverrides?.variableValues?.nome || 'Desconhecido',

            phoneNumber: data.customer?.number || '',

            company: data.assistantOverrides?.variableValues?.empresa || null,

            status: data.status,

            duration: data.duration || null,

            cost: data.cost || null,

            startedAt: data.startedAt ? new Date(data.startedAt) : null,

            endedAt: data.endedAt ? new Date(data.endedAt) : null,

            endedReason: data.endedReason || null

          }

        });

      } catch (createError) {

        console.error('Erro ao criar registro:', createError);

        // Continua mesmo se falhar a criação

      }

    }



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

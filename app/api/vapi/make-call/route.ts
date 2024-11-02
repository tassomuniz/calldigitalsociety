import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const API_KEY = process.env.VAPI_API_KEY;

  console.log("Iniciando requisição make-call");
  console.log("API Key presente:", !!API_KEY);

  if (!API_KEY) {
    return NextResponse.json({ message: 'API key not found' }, { status: 500 });
  }

  try {
    const body = await request.json();
    console.log("Corpo da requisição:", body);

    const { phoneNumberId, assistantId, customerNumber, variableValues } = body;

    // Validação
    const missingFields = [];
    if (!phoneNumberId) missingFields.push('phoneNumberId');
    if (!assistantId) missingFields.push('assistantId');
    if (!customerNumber) missingFields.push('customerNumber');
    if (!variableValues?.nome) missingFields.push('nome');

    if (missingFields.length > 0) {
      console.log("Campos faltando:", missingFields);
      return NextResponse.json({ 
        message: 'Missing required fields', 
        missingFields 
      }, { status: 400 });
    }

    const requestData = {
      phoneNumberId,
      assistantId,
      customer: { number: customerNumber },
      assistantOverrides: {
        variableValues: {
          nome: variableValues.nome,
          empresa: variableValues.empresa || "não informada"
        }
      }
    };

    console.log("Dados da requisição para Vapi:", requestData);

    // Criar chamada na API Vapi
    const response = await fetch('https://api.vapi.ai/call/phone', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const responseData = await response.json();
    console.log("Resposta da Vapi:", responseData);

    if (response.status === 201) {
      try {
        // Salvar no banco de dados
        const callHistory = await prisma.callHistory.create({
          data: {
            id: responseData.data.id,
            customerName: variableValues.nome,
            phoneNumber: customerNumber,
            company: variableValues.empresa || null,
            status: responseData.data.status,
            startedAt: new Date(responseData.data.createdAt),
          }
        });
        console.log("Chamada salva no banco:", callHistory);

        return NextResponse.json({ 
          message: 'Chamada criada com sucesso', 
          data: responseData 
        });
      } catch (dbError) {
        console.error("Erro ao salvar no banco:", dbError);
        // Mesmo com erro no banco, retornamos sucesso pois a chamada foi criada
        return NextResponse.json({ 
          message: 'Chamada criada com sucesso (erro ao salvar histórico)', 
          data: responseData 
        });
      }
    } else {
      console.error("Erro na resposta da Vapi:", responseData);
      return NextResponse.json({ 
        message: 'Falha ao criar chamada', 
        error: responseData 
      }, { 
        status: response.status 
      });
    }
  } catch (error) {
    console.error('Erro detalhado:', error);
    return NextResponse.json({ 
      message: 'Erro interno do servidor', 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500 
    });
  }
}







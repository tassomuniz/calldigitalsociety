import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';



export async function POST(request: NextRequest) {

  const API_KEY = process.env.VAPI_API_KEY;



  console.log("API Key:", API_KEY ? "Presente" : "Ausente");



  if (!API_KEY) {

    console.error("API Key não encontrada");

    return NextResponse.json({ message: 'API key not found' }, { status: 500 });

  }



  try {

    const body = await request.json();

    console.log('Corpo da requisição recebido:', body);



    const { phoneNumberId, assistantId, customerNumber, variableValues } = body;



    // Validação detalhada

    const missingFields = [];

    if (!phoneNumberId) missingFields.push('phoneNumberId');

    if (!assistantId) missingFields.push('assistantId');

    if (!customerNumber) missingFields.push('customerNumber');

    if (!variableValues?.nome) missingFields.push('nome');



    if (missingFields.length > 0) {

      return NextResponse.json({ 

        message: 'Missing required fields', 

        missingFields 

      }, { status: 400 });

    }



    const data = {

      phoneNumberId,

      assistantId,

      customer: {

        number: customerNumber,

      },

      assistantOverrides: {

        variableValues: {

          nome: variableValues.nome,

          empresa: variableValues.empresa || "não informada"

        }

      }

    };



    console.log('Request to Vapi:', data);



    console.log('Enviando requisição para Vapi API:', {

      url: 'https://api.vapi.ai/call/phone',

      method: 'POST',

      headers: {

        'Authorization': 'Bearer [REDACTED]',

        'Content-Type': 'application/json'

      },

      body: data

    });



    const response = await fetch('https://api.vapi.ai/call/phone', {

      method: 'POST',

      headers: {

        'Authorization': `Bearer ${API_KEY}`,

        'Content-Type': 'application/json',

      },

      body: JSON.stringify(data),

    });



    const responseData = await response.json();

    console.log('Resposta da Vapi API:', {

      status: response.status,

      data: responseData

    });



    if (response.status === 201) {

      return NextResponse.json({ 

        message: 'Chamada criada com sucesso', 

        data: responseData 

      });

    } else {

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







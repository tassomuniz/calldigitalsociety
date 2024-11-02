"use client";

import { Phone } from "lucide-react";
import React, { useState, useEffect } from "react";
import PhoneInput, { Value as E164Number } from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import "react-phone-number-input/style.css";

const phoneNumberId = process.env.NEXT_PUBLIC_VAPI_PHONE_ID;
const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

interface CallStatus {
  status: 'queued' | 'ringing' | 'in-progress' | 'completed' | 'failed' | 'no-answer' | 'busy' | 'ended';
  statusText: string;
  duration?: number;
  cost?: number;
}

export default function PhoneInputForm() {
  const [phoneNumber, setPhoneNumber] = useState<E164Number | undefined>();
  const [nome, setNome] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const pollCallStatus = async () => {
      if (!activeCallId) return;

      try {
        console.log('Consultando status da chamada:', activeCallId);
        
        const response = await fetch(`/api/vapi/call-status?callId=${activeCallId}`);
        const data = await response.json();
        
        console.log('Status recebido:', data);

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao buscar status da chamada');
        }

        setCallStatus({
          status: data.status,
          statusText: data.statusText,
          duration: data.duration,
          cost: data.cost
        });

        // Se a chamada terminou
        if (['completed', 'failed', 'no-answer', 'busy', 'ended'].includes(data.status)) {
          clearInterval(intervalId);
          setActiveCallId(null);

          if (data.status === 'completed' || data.status === 'ended') {
            const custo = data.cost ? `$${data.cost.toFixed(2)}` : 'não disponível';
            toast.success(`Chamada finalizada! Custo: ${custo}`);
          } else {
            const messages = {
              'failed': `A chamada falhou${data.endedReason ? `: ${data.endedReason}` : ''}`,
              'no-answer': 'Não houve resposta',
              'busy': 'Número ocupado'
            };
            toast.error(messages[data.status as keyof typeof messages] || 'A chamada falhou');
          }
        } else {
          // Feedback para estados em andamento
          const messages = {
            'queued': 'Chamada na fila...',
            'ringing': 'Telefone chamando...',
            'in-progress': 'Chamada em andamento!'
          };
          const message = messages[data.status as keyof typeof messages];
          if (message) {
            toast.info(message, { id: `call-status-${data.status}` });
          }
        }
      } catch (error) {
        console.error("Erro ao buscar status da chamada:", error);
      }
    };

    if (activeCallId) {
      pollCallStatus(); // Primeira verificação imediata
      intervalId = setInterval(pollCallStatus, 3000); // Aumentado para 3 segundos
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [activeCallId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || !nome) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/vapi/make-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumberId,
          assistantId,
          customerNumber: phoneNumber,
          variableValues: { nome, empresa: empresa || undefined }
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Chamada iniciada!");
        setActiveCallId(data.data.id);
        setPhoneNumber(undefined);
        setNome('');
        setEmpresa('');
      } else {
        throw new Error(data.message || "Erro ao iniciar a chamada");
      }
    } catch (error) {
      console.error("Erro no handleSubmit:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao iniciar a chamada");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Vapi Outbound Dialer</CardTitle>
          <CardDescription className="text-center">
            Preencha os dados para iniciar uma chamada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Digite o nome"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="empresa">Empresa</Label>
                <Input
                  id="empresa"
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  placeholder="Digite o nome da empresa (opcional)"
                />
              </div>

              <div className="space-y-2">
                <Label>Telefone *</Label>
                <div className="phone-input-container">
                  <PhoneInput
                    international
                    defaultCountry="BR"
                    value={phoneNumber}
                    onChange={setPhoneNumber}
                    flags={flags}
                    className="flex"
                    inputComponent={Input}
                    placeholder="Digite o número de telefone"
                    countrySelectProps={{
                      className: "!bg-background !text-foreground"
                    }}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-medium"
                disabled={loading || !phoneNumber || !nome}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Iniciando chamada...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Phone className="w-5 h-5" />
                    <span>Fazer Chamada</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {activeCallId && callStatus && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-xl">
              Status: {callStatus.statusText}
            </CardTitle>
            {callStatus.duration !== undefined && (
              <CardDescription>
                Duração: {Math.floor(callStatus.duration / 60)}:
                {(callStatus.duration % 60).toString().padStart(2, '0')}
              </CardDescription>
            )}
          </CardHeader>
        </Card>
      )}
    </div>
  );
}

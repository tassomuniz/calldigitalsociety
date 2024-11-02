"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Stats } from "./components/stats";
import { Filters } from "./components/filters";
import { useState, useEffect } from "react";
import { CallHistory } from "@prisma/client";

export default function HistoryPage() {
  const [allCalls, setAllCalls] = useState<CallHistory[]>([]);
  const [filteredCalls, setFilteredCalls] = useState<CallHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        const response = await fetch('/api/vapi/call-history');
        const data = await response.json();
        
        if (response.ok) {
          setAllCalls(data);
          setFilteredCalls(data);
        } else {
          throw new Error(data.error || 'Erro ao carregar histórico');
        }
      } catch (error) {
        console.error('Erro ao buscar histórico:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCalls();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-8 text-center">
        Carregando histórico...
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Histórico de Chamadas</h1>
      
      <Stats calls={allCalls} />
      <Filters calls={allCalls} onFilter={setFilteredCalls} />
      
      <div className="grid gap-4">
        {filteredCalls.map((call) => (
          <Card key={call.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{call.customerName}</span>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(call.createdAt), "dd/MM/yyyy HH:mm")}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p>{call.phoneNumber}</p>
                </div>
                {call.company && (
                  <div>
                    <p className="text-sm text-muted-foreground">Empresa</p>
                    <p>{call.company}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className={`
                    ${call.status === 'completed' ? 'text-green-600' : ''}
                    ${call.status === 'failed' ? 'text-red-600' : ''}
                  `}>
                    {call.status}
                  </p>
                </div>
                {call.duration && (
                  <div>
                    <p className="text-sm text-muted-foreground">Duração</p>
                    <p>{Math.floor(call.duration / 60)}:{(call.duration % 60).toString().padStart(2, '0')}</p>
                  </div>
                )}
                {call.cost && (
                  <div>
                    <p className="text-sm text-muted-foreground">Custo</p>
                    <p>${call.cost.toFixed(2)}</p>
                  </div>
                )}
                {call.endedReason && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Motivo do Término</p>
                    <p>{call.endedReason}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredCalls.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma chamada encontrada com os filtros atuais.
          </div>
        )}
      </div>
    </div>
  );
} 
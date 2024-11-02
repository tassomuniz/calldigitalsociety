import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CallHistory } from "@prisma/client";

interface StatsProps {
  calls: CallHistory[];
}

export function Stats({ calls }: StatsProps) {
  const totalCalls = calls.length;
  const completedCalls = calls.filter(call => call.status === 'completed').length;
  const totalCost = calls.reduce((acc, call) => acc + (call.cost || 0), 0);
  const avgDuration = calls.reduce((acc, call) => acc + (call.duration || 0), 0) / totalCalls || 0;

  return (
    <div className="grid gap-4 md:grid-cols-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Chamadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCalls}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Chamadas Completadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedCalls}</div>
          <p className="text-xs text-muted-foreground">
            {((completedCalls / totalCalls) * 100).toFixed(1)}% de sucesso
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${totalCost.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            Média: ${(totalCost / totalCalls).toFixed(2)}/chamada
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Duração Média</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.floor(avgDuration / 60)}:{Math.floor(avgDuration % 60).toString().padStart(2, '0')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
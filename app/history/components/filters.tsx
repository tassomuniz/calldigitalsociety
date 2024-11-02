"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { CallHistory } from "@prisma/client";

interface FiltersProps {
  calls: CallHistory[];
  onFilter: (filtered: CallHistory[]) => void;
}

export function Filters({ calls, onFilter }: FiltersProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const handleFilter = () => {
    let filtered = [...calls];

    if (search) {
      filtered = filtered.filter(call => 
        call.customerName.toLowerCase().includes(search.toLowerCase()) ||
        call.phoneNumber.includes(search) ||
        call.company?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status !== "all") {
      filtered = filtered.filter(call => call.status === status);
    }

    onFilter(filtered);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <Input
        placeholder="Buscar por nome, telefone ou empresa..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          handleFilter();
        }}
        className="md:w-1/3"
      />

      <Select
        value={status}
        onValueChange={(value) => {
          setStatus(value);
          handleFilter();
        }}
      >
        <SelectTrigger className="md:w-1/4">
          <SelectValue placeholder="Filtrar por status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="completed">Completadas</SelectItem>
          <SelectItem value="failed">Falhas</SelectItem>
          <SelectItem value="no-answer">Sem Resposta</SelectItem>
          <SelectItem value="busy">Ocupado</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
} 
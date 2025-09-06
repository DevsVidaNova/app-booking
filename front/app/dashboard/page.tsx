"use client";
import React from "react";
import { BookMarked, Church, MapPin, Users } from "lucide-react";
import { Analytics } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { AnalyticsService } from "@/services/analytics.service";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { ChartConfig } from "@/components/ui/chart";

export default function Dashboard() {
  const { data, error, isLoading } = useQuery<Analytics>({
    queryKey: [AnalyticsService.QUERY_KEY.ANALYTICS],
    queryFn: AnalyticsService.analytics
  });

  const { rooms, bookings, users, week, members } = data || {};

  if (isLoading) return <p>Carregando...</p>;
  if (error) return <p>Erro ao carregar usuários</p>;

  return (
    <div className="flex flex-col w-full px-4 py-4">
      <div className="container justify-center px-2 gap-2 flex flex-col self-center md:self-start">
        <h2 className="text-[32px] font-bold">Dashboard</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex-col flex border rounded-lg px-4 py-4 ">
            <div className="flex flex-row justify-between align-center items-center">
              <Users size={24} />
              <span className="text-[24px] font-bold">{users}</span>
            </div>
            <span className="opacity-70 text-[16px] font-regular">Usuários ativos</span>
          </div>
          <div className="flex-col flex border rounded-lg px-4 py-4 ">
            <div className="flex flex-row justify-between align-center items-center">
              <MapPin size={24} />
              <span className="text-[24px] font-bold">{rooms}</span>
            </div>
            <span className="opacity-70 text-[16px] font-regular">Salas criadas</span>
          </div>
          <div className="flex-col flex border rounded-lg px-4 py-4 ">
            <div className="flex flex-row justify-between align-center items-center">
              <BookMarked size={24} />
              <span className="text-[24px] font-bold">{bookings}</span>
            </div>
            <span className="opacity-70 text-[16px] font-regular">Reservas feitas</span>
          </div>
          <div className="flex-col flex border rounded-lg px-4 py-4 ">
            <div className="flex flex-row justify-between align-center items-center">
              <Church size={24} />
              <span className="text-[24px] font-bold">{members}</span>
            </div>
            <span className="opacity-70 text-[16px] font-regular">Membros</span>
          </div>
        </div>
        <h2 className="text-[32px] font-bold">Membros</h2>
        <MemberCharts />
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { label, value, percentage } = payload[0].payload;
    return (
      <div className="custom-tooltip p-2 bg-white border rounded shadow-md">
        <span className="label text-xl">{label}</span>
        <p className="value">Valor: {value}</p>
        <p className="percentage">Porcentagem: {percentage}%</p>
      </div>
    );
  }
  return null;
};

const MemberCharts = () => {
  const { data, error, isLoading } = useQuery<any>({
    queryKey: [AnalyticsService.QUERY_KEY.MEMBERS_ANALYTICS],
    queryFn: AnalyticsService.membersAnalytics
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading chart data</div>;
  }

  const chartConfig = {
    marital: {
      label: <span>Estado Civil</span>,
      color: "hsl(var(--chart-1))"
    },
    gender: {
      label: <span>Gênero</span>,
      color: "hsl(var(--chart-2))"
    },
    children: {
      label: <span>Quantidade de Filhos</span>,
      color: "hsl(var(--chart-3))"
    },
    age: {
      label: <span>Faixa Etária</span>,
      color: "hsl(var(--chart-4))"
    },
    city: {
      label: <span>Cidade</span>,
      color: "hsl(var(--chart-5))"
    },
    state: {
      label: <span>Estado</span>,
      color: "hsl(var(--chart-6))"
    }
  } satisfies ChartConfig;

  const formatChartData = (data: any) => {
    return data.map((item: any) => ({
      label: item.label,
      value: item.value,
      percentage: item.percentage,
      fill: item.fill
    }));
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
      {/* Gráfico de Estado Civil (BarChart) */}
      <Card className="flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle>Estado Civil</CardTitle>
          <CardDescription>Gráfico de Barras</CardDescription>
        </CardHeader>
        <CardContent className="flex-1  -ml-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formatChartData(data.marital)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="hsl(var(--chart-1))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Gênero (RadialBarChart) */}
      <Card className="flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle>Gênero</CardTitle>
          <CardDescription>Gráfico de Pizza</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 ">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={formatChartData(data.gender)} dataKey="value" label nameKey="label" outerRadius="80%" fill="hsl(var(--chart-4))">
                {data.age.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Quantidade de Filhos (BarChart) */}
      <Card className="flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle>Quantidade de Filhos</CardTitle>
          <CardDescription>Gráfico de Barras</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 -ml-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formatChartData(data.children)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="hsl(var(--chart-3))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Faixa Etária (PieChart) */}
      <Card className="flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle>Faixa Etária</CardTitle>
          <CardDescription>Gráfico de Pizza</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 ">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={formatChartData(data.age)} dataKey="value" label nameKey="label" outerRadius="80%" fill="hsl(var(--chart-4))">
                {data.age.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Estado (BarChart) */}
      <Card className="flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle>Estados</CardTitle>
          <CardDescription>Gráfico de Barras</CardDescription>
        </CardHeader>
        <CardContent className="flex-1  -ml-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formatChartData(data.state)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="hsl(var(--chart-6))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

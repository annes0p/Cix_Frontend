import React from 'react';
import { DollarSign, ShoppingBag, ClipboardList, UserPlus, Box } from 'lucide-react';

export default function MetricsGrid({ data }) {
  const totalVentas = data?.totalSales || '$ 18.456.700';
  const numVentas = data?.salesCount || '24';
  const ticketPromedio = data?.averageTicket || '$ 768.196';
  const clientesNuevos = data?.newClients || '6';
  const productosVendidos = data?.productsSold || '312';

  const metrics = [
    { title: 'Ventas totales', value: totalVentas, percentage: '18,4%', sub: 'vs 09/05/2025 - 15/05/2025', icon: <DollarSign className="text-white" size={20} />, bg: 'bg-emerald-700' },
    { title: 'Número de ventas', value: numVentas, percentage: '9,1%', sub: 'vs período anterior', icon: <ShoppingBag className="text-white" size={20} />, bg: 'bg-red-900' },
    { title: 'Ticket promedio', value: ticketPromedio, percentage: '8,7%', sub: 'vs período anterior', icon: <ClipboardList className="text-white" size={20} />, bg: 'bg-teal-700' },
    { title: 'Clientes nuevos', value: clientesNuevos, percentage: '20,0%', sub: 'vs período anterior', icon: <UserPlus className="text-white" size={20} />, bg: 'bg-red-950' },
    { title: 'Productos vendidos', value: productosVendidos, percentage: '15,6%', sub: 'vs período anterior', icon: <Box className="text-white" size={20} />, bg: 'bg-green-700' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {metrics.map((m, idx) => (
        <div key={idx} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-500">{m.title}</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-gray-900 tracking-tight">{m.value}</span>
              </div>
            </div>
            <div className={`p-2.5 rounded-full ${m.bg} shadow-sm shrink-0`}>{m.icon}</div>
          </div>
          <div className="mt-4 pt-2 border-t border-gray-50 flex items-center text-[11px] text-gray-400 font-medium">
            <span className="text-cixoil-green mr-1 font-bold">▲ {m.percentage}</span> {m.sub}
          </div>
        </div>
      ))}
    </div>
  );
}
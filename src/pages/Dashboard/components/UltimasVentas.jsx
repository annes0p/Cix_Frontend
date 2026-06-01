import React from 'react';

const salesData = [
  { id: 1, num: 'VEN-2025-0428', client: 'Constructora Andina S.A.', date: '16/05/2025', time: '10:45 a. m.', total: '$ 1.084.720', seller: 'Jorge Cerna', status: 'Completada' },
  { id: 2, num: 'VEN-2025-0427', client: 'Ferretería El Constructor', date: '16/05/2025', time: '09:20 a. m.', total: '$ 523.400', seller: 'Jorge Cerna', status: 'Completada' },
  { id: 3, num: 'VEN-2025-0426', client: 'Transportes Omega S.A.', date: '15/05/2025', time: '03:15 p. m.', total: '$ 2.156.800', seller: 'Jorge Cerna', status: 'Entregada' },
  { id: 4, num: 'VEN-2025-0425', client: 'Servicios Petroleros', date: '15/05/2025', time: '11:05 a. m.', total: '$ 789.600', seller: 'Jorge Cerna', status: 'Cancelada' },
  { id: 5, num: 'VEN-2025-0424', client: 'Industrias del Pacífico', date: '15/05/2025', time: '09:00 a. m.', total: '$ 1.250.300', seller: 'Jorge Cerna', status: 'Completada' },
];

export default function UltimasVentas() {
  const getStatusClass = (status) => {
    switch(status) {
      case 'Completada': return 'bg-green-50 text-cixoil-green border-green-100';
      case 'Entregada': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Cancelada': return 'bg-red-50 text-cixoil-red border-red-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-2">
          <h3 className="text-sm font-bold text-cixoil-red flex items-center gap-2">
            <span>🛒</span> Últimas ventas
          </h3>
          <button className="text-xs font-bold text-cixoil-red hover:underline flex items-center gap-0.5 group">
            Ver todas <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="pb-3 font-bold"># Venta</th>
                <th className="pb-3 font-bold">Cliente</th>
                <th className="pb-3 font-bold">Fecha</th>
                <th className="pb-3 font-bold">Total</th>
                <th className="pb-3 font-bold">Vendedor</th>
                <th className="pb-3 font-bold text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs font-semibold text-gray-700">
              {salesData.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 text-gray-500 font-mono text-[11px]">{sale.num}</td>
                  <td className="py-3 font-bold text-gray-900 truncate max-w-[150px]" title={sale.client}>
                    {sale.client}
                  </td>
                  <td className="py-3 text-gray-400 font-medium leading-tight text-[11px]">
                    <div>{sale.date}</div>
                    <div className="text-[10px] text-gray-400/80">{sale.time}</div>
                  </td>
                  <td className="py-3 font-black text-gray-900 tracking-tight">{sale.total}</td>
                  <td className="py-3 text-gray-500 font-medium">{sale.seller}</td>
                  <td className="py-3 text-center">
                    <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${getStatusClass(sale.status)}`}>
                      {sale.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
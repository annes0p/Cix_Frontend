import React from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend 
} from 'recharts';


const lineData = [
  { name: '09/05', estePeriodo: 1800000, periodoAnterior: 900000 },
  { name: '10/05', estePeriodo: 2400000, periodoAnterior: 1600000 },
  { name: '11/05', estePeriodo: 2900000, periodoAnterior: 1400000 },
  { name: '12/05', estePeriodo: 2600000, periodoAnterior: 2200000 },
  { name: '13/05', estePeriodo: 2300000, periodoAnterior: 1900000 },
  { name: '14/05', estePeriodo: 2900000, periodoAnterior: 2100000 },
  { name: '15/05', estePeriodo: 3200000, periodoAnterior: 2400000 },
  { name: '16/05', estePeriodo: 3500000, periodoAnterior: 2800000 },
];

const pieData = [
  { name: 'Lubricantes', value: 45, color: '#660000' },
  { name: 'Filtros', value: 25, color: '#801A1A' },
  { name: 'Grasas', value: 15, color: '#A6A6A6' },
];

export default function ChartsSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* PANEL IZQUIERDO: VENTAS POR DÍA */}
      <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-cixoil-red">Ventas por día</h3>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-cixoil-green rounded-full"></span>
              <span className="text-gray-700">Este período</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-gray-300 rounded-full"></span>
              <span className="text-gray-400">Período anterior</span>
            </div>
          </div>
        </div>

        <div className="w-full h-72 text-xs font-medium">
          <ResponsiveContainer width="100%" h="100%">
            <AreaChart data={lineData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEste" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#2E7D32" stopOpacity={0.01}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="name" stroke="#9CA3AF" tickLine={false} axisLine={false} />
              <YAxis 
                stroke="#9CA3AF" 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(v) => `$ ${(v / 1000000).toFixed(1)}M`} 
              />
              <Tooltip formatter={(value) => [`$ ${value.toLocaleString()}`, '']} />
              <Area type="monotone" dataKey="estePeriodo" stroke="#2E7D32" strokeWidth={3} fillOpacity={1} fill="url(#colorEste)" />
              <Area type="monotone" dataKey="periodoAnterior" stroke="#D1D5DB" strokeWidth={2} strokeDasharray="4 4" fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PANEL DERECHO: VENTAS POR CATEGORÍA */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
        <h3 className="text-sm font-bold text-cixoil-red mb-4">Ventas por categoría</h3>
        
        <div className="relative w-full h-48 flex items-center justify-center">
          <ResponsiveContainer width="100%" h="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          {/* Marcador Central del Total de Ventas */}
          <div className="absolute text-center flex flex-col justify-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total</span>
            <span className="text-base font-black text-gray-900 tracking-tight">$ 18.456.700</span>
          </div>
        </div>

        {/* Leyenda Personalizada para que se vea Compacta */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-semibold px-2 mt-4">
          {pieData.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between border-b border-gray-50 pb-1">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                <span className="truncate max-w-[80px]">{item.name}</span>
              </div>
              <span className="text-gray-950 font-bold">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
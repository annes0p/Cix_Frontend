import React from 'react';


const stockData = [
  { id: 1, name: 'Disolvente Industrial', detail: 'Galón', code: 'DIS-002', warehouse: 'Bodega Principal', current: 0, min: 8, status: 'Sin stock' },
  { id: 2, name: 'Filtro de Aceite Premium', detail: 'Unidad', code: 'FIL-001', warehouse: 'Bodega Principal', current: 2, min: 15, status: 'Stock bajo' },
  { id: 3, name: 'Transmisión 80W90', detail: 'Galón', code: 'TRF-001', warehouse: 'Bodega Secundaria', current: 8, min: 12, status: 'Stock bajo' },
  { id: 4, name: 'Grasa Litio EP 2', detail: '400g', code: 'GRA-003', warehouse: 'Bodega Secundaria', current: 5, min: 10, status: 'Stock bajo' },
  { id: 5, name: 'Aceite Hidráulico ISO 68', detail: 'Galón', code: 'HID-001', warehouse: 'Bodega Principal', current: 6, min: 15, status: 'Stock bajo' },
];

export default function StockCritico() {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-cixoil-red flex items-center gap-2">
            <span>⚠️</span> Stock crítico
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="pb-3 font-bold">Producto</th>
                <th className="pb-3 font-bold">Código</th>
                <th className="pb-3 font-bold">Almacén</th>
                <th className="pb-3 font-bold text-center">Stock act.</th>
                <th className="pb-3 font-bold text-center">Mín.</th>
                <th className="pb-3 font-bold text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs font-semibold text-gray-700">
              {stockData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-2.5 flex items-center gap-2">
                    <div className="w-7 h-7 bg-gray-50 border border-gray-100 rounded p-0.5 shrink-0">
                      <img src={PremiumIcon} alt="" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 truncate max-w-[140px]">{item.name}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{item.detail}</p>
                    </div>
                  </td>
                  <td className="py-2.5 text-gray-500 font-mono text-[11px]">{item.code}</td>
                  <td className="py-2.5 text-gray-500 font-medium">{item.warehouse}</td>
                  <td className={`py-2.5 text-center font-black text-sm ${item.current === 0 ? 'text-cixoil-red' : 'text-amber-600'}`}>
                    {item.current}
                  </td>
                  <td className="py-2.5 text-center text-gray-400 font-medium">{item.min}</td>
                  <td className="py-2.5 text-center">
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      item.status === 'Sin stock' 
                        ? 'bg-red-50 text-cixoil-red border border-red-100' 
                        : 'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <button className="text-left text-xs font-bold text-cixoil-red hover:underline mt-4 flex items-center gap-1 group w-max">
        Ver todos los productos con stock crítico 
        <span className="group-hover:translate-x-1 transition-transform">→</span>
      </button>
    </div>
  );
}
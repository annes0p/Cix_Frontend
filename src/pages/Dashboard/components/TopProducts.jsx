import React from 'react';


export default function TopProducts({ productsData }) {
  const products = productsData || [
    { id: 1, name: 'CIXOIL Premium 5W-30', detail: '4L', qty: 48 },
    { id: 2, name: 'CIXOIL Ultra 10W-40', detail: '4L', qty: 36 },
    { id: 3, name: 'Filtro de Aceite Premium', detail: 'Unidad', qty: 24 },
    { id: 4, name: 'Grasa Multiusos 400g', detail: '400g', qty: 18 },
    { id: 5, name: 'CIXOIL Diesel 15W-40', detail: '4L', qty: 16 },
  ];

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col h-full justify-between">
      <div className="flex items-center justify-between border-b border-gray-50 pb-3 mb-4">
        <h3 className="text-sm font-bold text-cixoil-red">Top 5 productos más vendidos</h3>
        <span className="text-[10px] font-bold text-gray-400 uppercase">Cantidad</span>
      </div>

      <div className="space-y-3.5 flex-1 flex flex-col justify-center">
        {products.map((p, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs group cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gray-100 rounded-md border border-gray-100 flex items-center justify-center p-1 shrink-0">
                
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900 group-hover:text-cixoil-red transition-colors">{p.name}</p>
                <p className="text-[11px] font-medium text-gray-400">{p.detail}</p>
              </div>
            </div>
            <span className="font-black text-sm text-cixoil-green bg-green-50/80 px-2.5 py-1 rounded-md text-center">{p.qty}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
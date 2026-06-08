export default function StockCritico({ stockCritico }) {
    if (!stockCritico || stockCritico.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full flex flex-col justify-center items-center gap-2">
                <span className="text-2xl">✓</span>
                <p className="text-sm font-bold text-cixoil-green">
                    Todo el stock esta en orden
                </p>
                <p className="text-xs text-gray-400">
                    No hay productos con stock critico
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-cixoil-red flex items-center gap-2">
                    Stock critico
                </h3>
                <span className="text-xs font-bold bg-red-50 text-cixoil-red px-2 py-1 rounded-md border border-red-100">
                    {stockCritico.length} productos
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            <th className="pb-3">Producto</th>
                            <th className="pb-3 text-center">Stock act.</th>
                            <th className="pb-3 text-center">Min.</th>
                            <th className="pb-3 text-center">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-xs font-semibold text-gray-700">
                        {stockCritico.slice(0, 5).map((item) => (
                            <tr
                                key={item.id}
                                className="hover:bg-slate-50/50 transition-colors"
                            >
                                <td className="py-2.5 font-bold text-gray-900 truncate max-w-[150px]">
                                    {item.product?.name}
                                </td>
                                <td
                                    className={`py-2.5 text-center font-black text-sm ${item.stock === 0 ? "text-cixoil-red" : "text-amber-600"}`}
                                >
                                    {item.stock}
                                </td>
                                <td className="py-2.5 text-center text-gray-400 font-medium">
                                    {item.minStock}
                                </td>
                                <td className="py-2.5 text-center">
                                    <span
                                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                            item.stock === 0
                                                ? "bg-red-50 text-cixoil-red border-red-100"
                                                : "bg-amber-50 text-amber-700 border-amber-100"
                                        }`}
                                    >
                                        {item.stock === 0
                                            ? "Sin stock"
                                            : "Stock bajo"}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

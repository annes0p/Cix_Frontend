export default function UltimasVentas({ ventas }) {
    // "Ultimas" = las mas recientes por fecha, no las primeras del arreglo
    // (el backend las devuelve en orden de creacion, no de fecha de venta).
    const ultimas = [...(ventas || [])]
        .sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate))
        .slice(0, 5);

    const getStatusClass = (status) => {
        switch (status) {
            case "COMPLETED":
                return "bg-green-50 text-cixoil-green border-green-100";
            case "CANCELED":
                return "bg-red-50 text-cixoil-red border-red-100";
            case "PENDING":
                return "bg-yellow-50 text-yellow-700 border-yellow-100";
            default:
                return "bg-gray-50 text-gray-600 border-gray-100";
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case "COMPLETED":
                return "Completada";
            case "CANCELED":
                return "Cancelada";
            case "PENDING":
                return "Pendiente";
            default:
                return status;
        }
    };

    const formatFecha = (fecha) => {
        if (!fecha) return "-";
        return new Date(fecha).toLocaleDateString("es-PE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    if (!ultimas.length) {
        return (
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full flex flex-col justify-center items-center gap-2">
                <p className="text-sm font-bold text-gray-400">
                    No hay ventas registradas
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-2">
                <h3 className="text-sm font-bold text-cixoil-red">
                    Ultimas ventas
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            <th className="pb-3">Venta</th>
                            <th className="pb-3">Cliente</th>
                            <th className="pb-3">Fecha</th>
                            <th className="pb-3">Total</th>
                            <th className="pb-3 text-center">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-xs font-semibold text-gray-700">
                        {ultimas.map((venta) => (
                            <tr
                                key={venta.id}
                                className="hover:bg-slate-50/50 transition-colors"
                            >
                                <td className="py-3 text-gray-500 font-mono text-[11px]">
                                    VEN-{venta.id.toString().padStart(4, "0")}
                                </td>
                                <td className="py-3 font-bold text-gray-900 truncate max-w-[130px]">
                                    {venta.client?.name || "-"}
                                </td>
                                <td className="py-3 text-gray-400 font-medium text-[11px]">
                                    {formatFecha(venta.saleDate)}
                                </td>
                                <td className="py-3 font-black text-gray-900 tracking-tight">
                                    S/. {venta.total || "-"}
                                </td>
                                <td className="py-3 text-center">
                                    <span
                                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${getStatusClass(venta.transactionStatus)}`}
                                    >
                                        {getStatusLabel(
                                            venta.transactionStatus,
                                        )}
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

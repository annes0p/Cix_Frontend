import { Eye } from "lucide-react";

function EstadoBadge({ estado }) {
    const estilos = {
        Pendiente: "bg-yellow-100 text-yellow-700",
        Aprobada: "bg-green-100 text-green-700",
        Recibida: "bg-blue-100 text-blue-700",
        Cancelada: "bg-red-100 text-red-700",
    };

    return (
        <span
            className={`px-2 py-1 rounded-md text-xs font-semibold ${estilos[estado] || "bg-gray-100 text-gray-700"}`}
        >
            {estado}
        </span>
    );
}

export default function OrdenesTabla({ ordenes, loading, onRecargar }) {
    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <p className="text-gray-400 text-sm">Cargando órdenes...</p>
            </div>
        );
    }

    if (!ordenes.length) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <p className="text-gray-400 text-sm">
                    No existen órdenes registradas.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-50 border-b">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Código
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Proveedor
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Fecha
                        </th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Total
                        </th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Estado
                        </th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {ordenes.map((orden) => (
                        <tr
                            key={orden.id}
                            className="border-b hover:bg-gray-50"
                        >
                            <td className="px-4 py-3 font-medium">
                                OC-{orden.id.toString().padStart(4, "0")}
                            </td>
                            <td className="px-4 py-3">
                                {orden.supplierName || orden.proveedor}
                            </td>
                            <td className="px-4 py-3">
                                {orden.purchaseDate || orden.fecha}
                            </td>
                            <td className="px-4 py-3 text-center font-semibold text-cixoil-red">
                                S/. {orden.totalAmount || orden.total}
                            </td>
                            <td className="px-4 py-3 text-center">
                                <EstadoBadge
                                    estado={orden.status || orden.estado}
                                />
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex justify-center">
                                    <button className="text-blue-500 hover:text-blue-700">
                                        <Eye size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="px-4 py-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                    Total órdenes: {ordenes.length}
                </p>
            </div>
        </div>
    );
}

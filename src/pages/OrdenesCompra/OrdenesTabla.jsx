import { Eye } from "lucide-react";
import { useState } from "react";
import ModalDetalleOrden from "./ModalDetalleOrden";

function EstadoBadge({ estado }) {
    const estilos = {
        PENDING: "bg-yellow-100 text-yellow-700",
        PARTIALLY_RECEIVED: "bg-blue-100 text-blue-700",
        RECEIVED: "bg-green-100 text-green-700",
    };
    const etiquetas = {
        PENDING: "Pendiente",
        PARTIALLY_RECEIVED: "Recibido parcialmente",
        RECEIVED: "Recibido",
    };

    return (
        <span
            className={`px-2 py-1 rounded-md text-xs font-semibold ${estilos[estado] || "bg-gray-100 text-gray-700"}`}
        >
            {etiquetas[estado] || estado || "Sin estado"}
        </span>
    );
}

export default function OrdenesTabla({ ordenes, loading, onRecargar }) {
    const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <p className="text-gray-400 text-sm">Cargando ordenes...</p>
            </div>
        );
    }

    if (!ordenes.length) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <p className="text-gray-400 text-sm">
                    No existen ordenes registradas.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Vista móvil: cards */}
                <div className="lg:hidden divide-y divide-gray-100">
                    {ordenes.map((orden) => (
                        <div
                            key={orden.id}
                            onClick={() => setOrdenSeleccionada(orden)}
                            className="p-4 active:bg-gray-50 cursor-pointer"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <p className="font-semibold text-gray-900">
                                    OC-{orden.id.toString().padStart(4, "0")}
                                </p>
                                <EstadoBadge estado={orden.receptionStatus} />
                            </div>
                            <p className="text-sm text-gray-700 mb-1">
                                {orden.supplier?.legalName}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <div>
                                    <p>Compra: {orden.purchasedAt}</p>
                                    <p>
                                        Entrega:{" "}
                                        {orden.estimatedDeliveryAt || "-"}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-cixoil-red text-sm">
                                        S/. {orden.total}
                                    </span>
                                    <Eye size={16} className="text-blue-500" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Vista desktop: tabla */}
                <table className="w-full text-sm hidden lg:table">
                    <thead>
                        <tr className="bg-gray-50 border-b">
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                Codigo
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                Proveedor
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                Fecha compra
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                Entrega estimada
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
                                    {orden.supplier?.legalName}
                                </td>
                                <td className="px-4 py-3">
                                    {orden.purchasedAt}
                                </td>
                                <td className="px-4 py-3">
                                    {orden.estimatedDeliveryAt || "-"}
                                </td>
                                <td className="px-4 py-3 text-center font-semibold text-cixoil-red">
                                    S/. {orden.total}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <EstadoBadge
                                        estado={orden.receptionStatus}
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-center">
                                        <button
                                            onClick={() =>
                                                setOrdenSeleccionada(orden)
                                            }
                                            className="text-blue-500 hover:text-blue-700"
                                        >
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
                        Total ordenes: {ordenes.length}
                    </p>
                </div>
            </div>

            {ordenSeleccionada && (
                <ModalDetalleOrden
                    orden={ordenSeleccionada}
                    onClose={() => setOrdenSeleccionada(null)}
                    onActualizar={() => {
                        setOrdenSeleccionada(null);
                        onRecargar?.();
                    }}
                />
            )}
        </>
    );
}

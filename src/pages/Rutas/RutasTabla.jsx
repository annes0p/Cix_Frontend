import { Eye } from "lucide-react";
import { useState } from "react";
import ModalDetalleRuta from "./ModalDetalleRuta";

const ESTILOS_ESTADO = {
    PENDING: "bg-yellow-100 text-yellow-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELED: "bg-gray-200 text-gray-500",
};

const ETIQUETAS_ESTADO = {
    PENDING: "Pendiente",
    IN_PROGRESS: "En curso",
    COMPLETED: "Completado",
    CANCELED: "Cancelado",
};

function EstadoBadge({ estado }) {
    return (
        <span
            className={`px-2 py-1 rounded-md text-xs font-semibold ${ESTILOS_ESTADO[estado] || "bg-gray-100 text-gray-700"}`}
        >
            {ETIQUETAS_ESTADO[estado] || estado || "Sin estado"}
        </span>
    );
}

export default function RutasTabla({ rutas, loading, onRecargar }) {
    const [rutaSeleccionadaId, setRutaSeleccionadaId] = useState(null);

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <p className="text-gray-400 text-sm">Cargando rutas...</p>
            </div>
        );
    }

    if (!rutas.length) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <p className="text-gray-400 text-sm">
                    No existen rutas registradas.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Vista movil: cards */}
                <div className="lg:hidden divide-y divide-gray-100">
                    {rutas.map((ruta) => (
                        <div
                            key={ruta.id}
                            onClick={() => setRutaSeleccionadaId(ruta.id)}
                            className="p-4 active:bg-gray-50 cursor-pointer"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <p className="font-semibold text-gray-900">
                                    Ruta #
                                    {ruta.id.toString().padStart(4, "0")}
                                </p>
                                <EstadoBadge estado={ruta.progressStatus} />
                            </div>
                            <p className="text-sm text-gray-700 mb-1">
                                {ruta.user ? "Vendedor" : "-"}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <p>Fecha: {ruta.routeDate}</p>
                                <div className="flex items-center gap-3">
                                    <span>
                                        {ruta.trips?.length || 0} parada
                                        {ruta.trips?.length === 1 ? "" : "s"}
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
                                Ruta
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                Vendedor
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                Fecha
                            </th>
                            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                Paradas
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
                        {rutas.map((ruta) => (
                            <tr
                                key={ruta.id}
                                className="border-b hover:bg-gray-50"
                            >
                                <td className="px-4 py-3 font-medium">
                                    Ruta #
                                    {ruta.id.toString().padStart(4, "0")}
                                </td>
                                <td className="px-4 py-3">
                                    {ruta.user?.username || "-"}
                                </td>
                                <td className="px-4 py-3">
                                    {ruta.routeDate}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {ruta.trips?.length || 0}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <EstadoBadge
                                        estado={ruta.progressStatus}
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-center">
                                        <button
                                            onClick={() =>
                                                setRutaSeleccionadaId(
                                                    ruta.id,
                                                )
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
                        Total rutas: {rutas.length}
                    </p>
                </div>
            </div>

            {rutaSeleccionadaId && (
                <ModalDetalleRuta
                    rutaId={rutaSeleccionadaId}
                    onClose={() => setRutaSeleccionadaId(null)}
                    onActualizar={() => onRecargar?.()}
                />
            )}
        </>
    );
}

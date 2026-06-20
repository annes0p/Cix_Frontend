import { useState } from "react";
import ModalDetalleIncidencia from "./ModalDetalleIncidencia";

function EstadoBadge({ estado }) {
    const estilos = {
        ABIERTA: "bg-red-100 text-red-700",
        EN_PROCESO: "bg-orange-100 text-orange-700",
        RESUELTA: "bg-green-100 text-green-700",
        CERRADA: "bg-gray-100 text-gray-600",
    };
    const etiquetas = {
        ABIERTA: "Abierta",
        EN_PROCESO: "En proceso",
        RESUELTA: "Resuelta",
        CERRADA: "Cerrada",
    };
    return (
        <span
            className={`px-2 py-1 rounded-md text-xs font-semibold ${estilos[estado] || "bg-gray-100 text-gray-600"}`}
        >
            {etiquetas[estado] || estado}
        </span>
    );
}

function PrioridadBadge({ prioridad }) {
    const estilos = {
        ALTA: "bg-red-100 text-red-700",
        MEDIA: "bg-yellow-100 text-yellow-700",
        BAJA: "bg-gray-100 text-gray-600",
    };
    const etiquetas = {
        ALTA: "Alta",
        MEDIA: "Media",
        BAJA: "Baja",
    };
    return (
        <span
            className={`px-2 py-1 rounded-md text-xs font-semibold ${estilos[prioridad] || "bg-gray-100 text-gray-600"}`}
        >
            {etiquetas[prioridad] || prioridad}
        </span>
    );
}

const TIPO_LABELS = {
    PRODUCTO_DANADO: "Producto dañado",
    ERROR_PEDIDO: "Error en pedido",
    DEVOLUCION: "Devolución",
    QUEJA_CLIENTE: "Queja de cliente",
    PROBLEMA_PROVEEDOR: "Problema con proveedor",
};

const formatFecha = (iso) =>
    new Date(iso).toLocaleDateString("es-PE", { dateStyle: "medium" });

export default function IncidenciasTabla({
    incidencias,
    loading,
    onActualizar,
}) {
    const [seleccionada, setSeleccionada] = useState(null);

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <p className="text-gray-400 text-sm">Cargando incidencias...</p>
            </div>
        );
    }

    if (!incidencias.length) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <p className="text-gray-400 text-sm">
                    No hay incidencias para este filtro.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Vista móvil: cards */}
                <div className="lg:hidden divide-y divide-gray-100">
                    {incidencias.map((inc) => (
                        <div
                            key={inc.id}
                            onClick={() => setSeleccionada(inc)}
                            className="p-4 active:bg-gray-50 cursor-pointer"
                        >
                            <div className="flex items-center justify-between gap-2 mb-1">
                                <p className="font-semibold text-gray-900 truncate">
                                    {inc.titulo}
                                </p>
                                <EstadoBadge estado={inc.estado} />
                            </div>
                            <p className="text-xs text-gray-500 mb-2">
                                {TIPO_LABELS[inc.tipo] || inc.tipo}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-400">
                                <PrioridadBadge prioridad={inc.prioridad} />
                                <span>{formatFecha(inc.createdAt)}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Vista desktop: tabla */}
                <table className="w-full text-sm hidden lg:table">
                    <thead>
                        <tr className="bg-gray-50 border-b">
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                Titulo
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                Tipo
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                Reportado por
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                Fecha
                            </th>
                            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                Prioridad
                            </th>
                            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                Estado
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {incidencias.map((inc) => (
                            <tr
                                key={inc.id}
                                onClick={() => setSeleccionada(inc)}
                                className="border-b hover:bg-gray-50 cursor-pointer"
                            >
                                <td className="px-4 py-3 font-medium text-gray-900">
                                    {inc.titulo}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                    {TIPO_LABELS[inc.tipo] || inc.tipo}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                    {inc.reportadoPor}
                                </td>
                                <td className="px-4 py-3 text-gray-500">
                                    {formatFecha(inc.createdAt)}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <PrioridadBadge prioridad={inc.prioridad} />
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <EstadoBadge estado={inc.estado} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="px-4 py-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                        Total incidencias: {incidencias.length}
                    </p>
                </div>
            </div>

            {seleccionada && (
                <ModalDetalleIncidencia
                    incidencia={seleccionada}
                    onClose={() => setSeleccionada(null)}
                    onActualizar={() => {
                        onActualizar();
                        setSeleccionada(null);
                    }}
                />
            )}
        </>
    );
}

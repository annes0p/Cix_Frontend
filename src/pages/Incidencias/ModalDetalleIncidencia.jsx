import { X } from "lucide-react";
import { useState } from "react";
import {
    actualizarEstadoIncidencia,
    ESTADOS_INCIDENCIA,
} from "../../services/incidenciasService";

const TIPO_LABELS = {
    PRODUCTO_DANADO: "Producto danado",
    ERROR_PEDIDO: "Error en pedido",
    DEVOLUCION: "Devolucion",
    QUEJA_CLIENTE: "Queja de cliente",
    PROBLEMA_PROVEEDOR: "Problema con proveedor",
};

const PRIORIDAD_ESTILOS = {
    ALTA: "bg-red-100 text-red-700",
    MEDIA: "bg-yellow-100 text-yellow-700",
    BAJA: "bg-gray-100 text-gray-600",
};

const PRIORIDAD_LABELS = {
    ALTA: "Alta",
    MEDIA: "Media",
    BAJA: "Baja",
};

const formatFecha = (iso) =>
    iso
        ? new Date(iso).toLocaleString("es-PE", {
              dateStyle: "medium",
              timeStyle: "short",
          })
        : "-";

export default function ModalDetalleIncidencia({
    incidencia,
    onClose,
    onActualizar,
}) {
    const [estado, setEstado] = useState(incidencia.estado);
    const [guardando, setGuardando] = useState(false);

    const handleGuardar = async () => {
        try {
            setGuardando(true);
            await actualizarEstadoIncidencia(incidencia.id, estado);
            onActualizar();
        } catch (error) {
            console.error("Error al actualizar incidencia:", error);
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="font-bold text-gray-800 text-lg">
                        Detalle de incidencia
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                            Titulo
                        </p>
                        <p className="font-bold text-gray-900">
                            {incidencia.titulo}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                Tipo
                            </p>
                            <p className="text-sm text-gray-700">
                                {TIPO_LABELS[incidencia.tipo] ||
                                    incidencia.tipo}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                Prioridad
                            </p>
                            <span
                                className={`inline-block px-2 py-1 rounded-md text-xs font-semibold ${
                                    PRIORIDAD_ESTILOS[incidencia.prioridad] ||
                                    "bg-gray-100 text-gray-600"
                                }`}
                            >
                                {PRIORIDAD_LABELS[incidencia.prioridad] ||
                                    incidencia.prioridad}
                            </span>
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                            Descripcion
                        </p>
                        <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3">
                            {incidencia.descripcion}
                        </p>
                    </div>

                    {incidencia.relacionado?.tipo && (
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                Relacionado
                            </p>
                            <p className="text-sm text-gray-700">
                                {incidencia.relacionado.tipo}
                                {incidencia.relacionado.nombre
                                    ? ` — ${incidencia.relacionado.nombre}`
                                    : ""}
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                Reportado por
                            </p>
                            <p className="text-sm text-gray-700">
                                {incidencia.reportadoPor}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                Fecha de registro
                            </p>
                            <p className="text-sm text-gray-700">
                                {formatFecha(incidencia.createdAt)}
                            </p>
                        </div>
                    </div>

                    {incidencia.resolvedAt && (
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                Fecha de resolucion
                            </p>
                            <p className="text-sm text-gray-700">
                                {formatFecha(incidencia.resolvedAt)}
                            </p>
                        </div>
                    )}

                    <div className="pt-2 border-t border-gray-100">
                        <label className="text-sm font-medium text-gray-600 mb-1.5 block">
                            Cambiar estado
                        </label>
                        <select
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cixoil-red"
                            value={estado}
                            onChange={(e) => setEstado(e.target.value)}
                        >
                            {ESTADOS_INCIDENCIA.map((e) => (
                                <option key={e.value} value={e.value}>
                                    {e.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
                        >
                            Cerrar
                        </button>
                        <button
                            onClick={handleGuardar}
                            disabled={guardando || estado === incidencia.estado}
                            className="px-5 py-2.5 rounded-lg text-sm font-medium bg-cixoil-red text-white hover:bg-red-900 disabled:opacity-50"
                        >
                            {guardando ? "Guardando..." : "Guardar cambios"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

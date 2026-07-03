import { X } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../services/api";

const ESTADOS = [
    { value: "PENDING", label: "Pendiente" },
    { value: "COMPLETED", label: "Pagada" },
    { value: "CANCELED", label: "Anulada" },
];

export default function ModalEditarMovimiento({ mov, onClose, onMovimientoActualizado }) {
    const [estado, setEstado] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (mov) {
            const estadoReverso = {
                Completado: "COMPLETED",
                Pendiente: "PENDING",
                Cancelado: "CANCELED",
                "En proceso": "PENDING",
            };
            setEstado(estadoReverso[mov.estado] || "PENDING");
        }
    }, [mov]);

    const handleGuardar = async () => {
        setError(null);
        setLoading(true);
        try {
            await api.patch(`/sales/${mov._raw?.id}/cancel`);
            const estadoMap = {
                PENDING: "Pendiente",
                COMPLETED: "Completado",
                CANCELED: "Cancelado",
            };
            onMovimientoActualizado({ ...mov, estado: estadoMap[estado] });
            onClose();
        } catch {
            onMovimientoActualizado({ ...mov });
            onClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">Editar estado</h2>
                        <p className="text-xs text-gray-400 mt-0.5">{mov?.id} — {mov?.cliente}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100">
                        <X size={18} />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                            Estado de la venta
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {ESTADOS.map((e) => (
                                <button
                                    key={e.value}
                                    type="button"
                                    onClick={() => setEstado(e.value)}
                                    className={`py-2 rounded-lg text-xs font-semibold border transition-colors ${
                                        estado === e.value
                                            ? "bg-cixoil-red text-white border-cixoil-red"
                                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                                    }`}
                                >
                                    {e.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg px-4 py-3 text-xs text-gray-500 space-y-1">
                        <div className="flex justify-between">
                            <span>Cliente</span>
                            <span className="font-medium text-gray-700">{mov?.cliente}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Total</span>
                            <span className="font-medium text-gray-700">$ {mov?.total?.toLocaleString("es-CO")}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Fecha</span>
                            <span className="font-medium text-gray-700">{mov?.fecha ? new Date(mov.fecha).toLocaleDateString("es-CO") : "-"}</span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleGuardar}
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-cixoil-red text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
                        >
                            {loading ? "Guardando..." : "Guardar"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

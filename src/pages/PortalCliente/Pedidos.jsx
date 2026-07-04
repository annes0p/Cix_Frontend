import {
    ArrowLeft,
    Loader2,
    MapPin,
    Search,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { getPedidosPorDocumento } from "../../services/clientPortalService";

const ESTILOS_ESTADO = {
    PENDING: "bg-yellow-100 text-yellow-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELED: "bg-gray-200 text-gray-500",
};

const ETIQUETAS_ESTADO = {
    PENDING: "Pendiente de despacho",
    IN_PROGRESS: "En camino",
    COMPLETED: "Entregado",
    CANCELED: "Cancelado",
};

export default function PortalClientePedidos() {
    const [docNumber, setDocNumber] = useState("");
    const [pedidos, setPedidos] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);

    const buscar = async (e) => {
        e.preventDefault();

        const documento = docNumber.trim();
        if (!documento) {
            setError("Ingresa tu número de DNI o RUC.");
            setPedidos(null);
            return;
        }
        if (!/^\d{8}$|^\d{11}$/.test(documento)) {
            setError("El documento debe tener 8 dígitos (DNI) u 11 dígitos (RUC).");
            setPedidos(null);
            return;
        }

        try {
            setCargando(true);
            setError(null);
            const data = await getPedidosPorDocumento(documento);
            setPedidos(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error al buscar pedidos:", err);
            setError(
                err.response?.data?.message ||
                    "No se pudo buscar tus pedidos. Intenta de nuevo.",
            );
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-2xl mx-auto">
                <Link
                    to="/portal-cliente"
                    className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
                >
                    <ArrowLeft size={16} />
                    Volver
                </Link>

                <div className="text-center mb-6">
                    <h1 className="text-xl font-black text-cixoil-red">
                        Mis pedidos
                    </h1>
                    <p className="text-sm text-gray-500">
                        Ingresa tu DNI o RUC para ver tus pedidos
                    </p>
                </div>

                <form onSubmit={buscar} className="flex gap-2 mb-6">
                    <input
                        type="text"
                        value={docNumber}
                        onChange={(e) => setDocNumber(e.target.value)}
                        placeholder="N° de DNI o RUC"
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-cixoil-red/30"
                    />
                    <button
                        type="submit"
                        disabled={cargando}
                        className="px-4 py-2.5 rounded-xl bg-cixoil-red text-white font-semibold text-sm flex items-center gap-1 disabled:opacity-50"
                    >
                        {cargando ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Search size={16} />
                        )}
                        Buscar
                    </button>
                </form>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-4 rounded-xl text-center mb-4">
                        {error}
                    </div>
                )}

                {pedidos && pedidos.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-10">
                        No encontramos pedidos con ese documento.
                    </p>
                )}

                <div className="space-y-3">
                    {pedidos?.map((p) => (
                        <div
                            key={p.tripId}
                            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex items-center justify-between gap-3"
                        >
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                                    <MapPin size={14} className="text-cixoil-red shrink-0" />
                                    <span className="truncate">
                                        {p.origin} → {p.destination}
                                    </span>
                                </div>
                                {p.routeDate && (
                                    <p className="text-xs text-gray-400">
                                        Fecha: {p.routeDate}
                                    </p>
                                )}
                                <span
                                    className={`inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${ESTILOS_ESTADO[p.progressStatus] || "bg-gray-100 text-gray-500"}`}
                                >
                                    {ETIQUETAS_ESTADO[p.progressStatus] || p.progressStatus}
                                </span>
                            </div>
                            <Link
                                to={`/seguimiento/${p.trackingToken}`}
                                className="shrink-0 text-xs font-semibold bg-cixoil-red text-white px-3 py-2 rounded-lg hover:opacity-90"
                            >
                                Ver en vivo
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

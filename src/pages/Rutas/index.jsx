import { Map, Plus, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { getRutas } from "../../services/rutasService";
import ModalNuevaRuta from "./ModalNuevaRuta";
import RutasTabla from "./RutasTabla";

export default function Rutas() {
    const [rutas, setRutas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState("todas");
    const [showModal, setShowModal] = useState(false);

    const cargarRutas = async () => {
        try {
            setLoading(true);
            const data = await getRutas();
            setRutas(data);
        } catch (error) {
            console.error("Error al cargar rutas:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarRutas();
    }, []);

    const rutasFiltradas =
        filtroEstado === "todas"
            ? rutas
            : rutas.filter((r) => r.progressStatus === filtroEstado);

    const contadores = {
        pendientes: rutas.filter((r) => r.progressStatus === "PENDING")
            .length,
        enCurso: rutas.filter((r) => r.progressStatus === "IN_PROGRESS")
            .length,
        completadas: rutas.filter((r) => r.progressStatus === "COMPLETED")
            .length,
    };

    const ESTADOS = [
        { value: "PENDING", label: "Pendiente" },
        { value: "IN_PROGRESS", label: "En curso" },
        { value: "COMPLETED", label: "Completado" },
        { value: "CANCELED", label: "Cancelado" },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-cixoil-red">
                        Rutas
                    </h1>
                    <p className="text-sm text-gray-500">
                        Planificacion y seguimiento del reparto diario
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={cargarRutas}
                        disabled={loading}
                        className="flex items-center gap-1 text-xs font-medium text-cixoil-red hover:opacity-80 disabled:opacity-50"
                    >
                        <RefreshCw
                            size={14}
                            className={loading ? "animate-spin" : ""}
                        />
                        Actualizar
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-cixoil-green text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium"
                    >
                        <Plus size={16} />
                        Nueva ruta
                    </button>
                </div>
            </div>

            <div className="p-4 sm:p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                    <div className="bg-white rounded-xl border border-gray-200 px-4 sm:px-5 py-4 shadow-sm min-w-0">
                        <p className="text-xs font-semibold text-gray-500 mb-1">
                            Total
                        </p>
                        <p className="text-2xl font-black text-gray-900">
                            {rutas.length}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            Rutas registradas
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-yellow-200 px-4 sm:px-5 py-4 shadow-sm min-w-0">
                        <p className="text-xs font-semibold text-yellow-600 mb-1">
                            Pendientes
                        </p>
                        <p className="text-2xl font-black text-yellow-600">
                            {contadores.pendientes}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            Sin iniciar
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-blue-200 px-4 sm:px-5 py-4 shadow-sm min-w-0">
                        <p className="text-xs font-semibold text-blue-500 mb-1">
                            En curso
                        </p>
                        <p className="text-2xl font-black text-blue-600">
                            {contadores.enCurso}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            Repartiendo hoy
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-green-200 px-4 sm:px-5 py-4 shadow-sm min-w-0">
                        <p className="text-xs font-semibold text-green-600 mb-1">
                            Completadas
                        </p>
                        <p className="text-2xl font-black text-green-600">
                            {contadores.completadas}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            Reparto terminado
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 px-4 sm:px-6 py-4 mb-6 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                        <Map size={22} className="text-red-600" />
                    </div>
                    <div>
                        <h2 className="font-bold text-cixoil-red text-lg">
                            Rutas de reparto
                        </h2>
                        <p className="text-sm text-gray-500">
                            Vendedor asignado, paradas del dia y estado de
                            despacho
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
                    <button
                        onClick={() => setFiltroEstado("todas")}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                            filtroEstado === "todas"
                                ? "bg-cixoil-red text-white"
                                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                        Todas
                    </button>
                    {ESTADOS.map((e) => (
                        <button
                            key={e.value}
                            onClick={() => setFiltroEstado(e.value)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                                filtroEstado === e.value
                                    ? "bg-cixoil-red text-white"
                                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            {e.label}
                        </button>
                    ))}
                </div>

                <RutasTabla
                    rutas={rutasFiltradas}
                    loading={loading}
                    onRecargar={cargarRutas}
                />
            </div>

            {showModal && (
                <ModalNuevaRuta
                    onClose={() => setShowModal(false)}
                    onGuardar={cargarRutas}
                />
            )}
        </div>
    );
}

import { AlertCircle, Plus, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import {
    ESTADOS_INCIDENCIA,
    getIncidencias,
} from "../../services/incidenciasService";
import IncidenciasTabla from "./IncidenciasTabla";
import ModalIncidencia from "./ModalIncidencia";

export default function Incidencias() {
    const [incidencias, setIncidencias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState("todas");
    const [showModal, setShowModal] = useState(false);

    const cargarIncidencias = async () => {
        try {
            setLoading(true);
            const data = await getIncidencias();
            setIncidencias(data);
        } catch (error) {
            console.error("Error al cargar incidencias:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarIncidencias();
    }, []);

    const incidenciasFiltradas =
        filtroEstado === "todas"
            ? incidencias
            : incidencias.filter((i) => i.estado === filtroEstado);

    const contadores = {
        abiertas: incidencias.filter((i) => i.estado === "ABIERTA").length,
        enProceso: incidencias.filter((i) => i.estado === "EN_PROCESO").length,
        resueltas: incidencias.filter(
            (i) => i.estado === "RESUELTA" || i.estado === "CERRADA",
        ).length,
        altaPrioridad: incidencias.filter(
            (i) =>
                i.prioridad === "ALTA" &&
                i.estado !== "RESUELTA" &&
                i.estado !== "CERRADA",
        ).length,
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-cixoil-red">
                        Incidencias
                    </h1>
                    <p className="text-sm text-gray-500">
                        Registro y seguimiento de incidencias operativas
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={cargarIncidencias}
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
                        Nueva incidencia
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
                            {incidencias.length}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            Incidencias registradas
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-red-200 px-4 sm:px-5 py-4 shadow-sm min-w-0">
                        <p className="text-xs font-semibold text-red-500 mb-1">
                            Abiertas
                        </p>
                        <p className="text-2xl font-black text-cixoil-red">
                            {contadores.abiertas}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            Sin atender
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-orange-200 px-4 sm:px-5 py-4 shadow-sm min-w-0">
                        <p className="text-xs font-semibold text-orange-500 mb-1">
                            En proceso
                        </p>
                        <p className="text-2xl font-black text-orange-600">
                            {contadores.enProceso}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            Siendo atendidas
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-yellow-200 px-4 sm:px-5 py-4 shadow-sm min-w-0">
                        <p className="text-xs font-semibold text-yellow-600 mb-1">
                            Alta prioridad
                        </p>
                        <p className="text-2xl font-black text-yellow-600">
                            {contadores.altaPrioridad}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            Pendientes urgentes
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 px-4 sm:px-6 py-4 mb-6 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                        <AlertCircle size={22} className="text-red-600" />
                    </div>
                    <div>
                        <h2 className="font-bold text-cixoil-red text-lg">
                            Incidencias registradas
                        </h2>
                        <p className="text-sm text-gray-500">
                            Control de problemas operativos y reclamos
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
                    {ESTADOS_INCIDENCIA.map((e) => (
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

                <IncidenciasTabla
                    incidencias={incidenciasFiltradas}
                    loading={loading}
                    onActualizar={cargarIncidencias}
                />
            </div>

            {showModal && (
                <ModalIncidencia
                    onClose={() => setShowModal(false)}
                    onGuardar={cargarIncidencias}
                />
            )}
        </div>
    );
}

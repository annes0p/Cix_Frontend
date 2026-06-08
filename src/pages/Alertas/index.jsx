import { Bell, RefreshCw, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import {
    calcularPrediccion,
    getInventario,
    getMovimientos,
} from "../../services/alertasService";
import AlertasTabla from "./AlertasTabla";

export default function Alertas() {
    const [alertas, setAlertas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState("todos");

    const cargarAlertas = async () => {
        try {
            setLoading(true);
            const [inventario, movimientos] = await Promise.all([
                getInventario(),
                getMovimientos(),
            ]);
            const predicciones = calcularPrediccion(inventario, movimientos);
            const conAlertas = predicciones.filter(
                (item) => item.nivelRiesgo !== "normal"
            );
            setAlertas(conAlertas);
        } catch (error) {
            console.error("Error al cargar alertas:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarAlertas();
    }, []);

    const alertasFiltradas = filtro === "todos"
        ? alertas
        : alertas.filter((a) => a.nivelRiesgo === filtro);

    const contadores = {
        agotado: alertas.filter((a) => a.nivelRiesgo === "agotado").length,
        critico: alertas.filter((a) => a.nivelRiesgo === "critico").length,
        advertencia: alertas.filter((a) => a.nivelRiesgo === "advertencia").length,
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-cixoil-red">Alertas</h1>
                    <p className="text-sm text-gray-500">Monitoreo de stock critico e inventario predictivo</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600">CIXOIL S.A.C.</span>
                    <button
                        onClick={cargarAlertas}
                        disabled={loading}
                        className="flex items-center gap-1 text-xs font-medium text-cixoil-red hover:opacity-80 disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                        Actualizar
                    </button>
                </div>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm">
                        <p className="text-xs font-semibold text-gray-500 mb-1">Total alertas</p>
                        <p className="text-2xl font-black text-gray-900">{alertas.length}</p>
                        <p className="text-xs text-gray-400 mt-1">Productos en riesgo</p>
                    </div>
                    <div className="bg-white rounded-xl border border-red-200 px-5 py-4 shadow-sm">
                        <p className="text-xs font-semibold text-red-500 mb-1">Sin stock</p>
                        <p className="text-2xl font-black text-cixoil-red">{contadores.agotado}</p>
                        <p className="text-xs text-gray-400 mt-1">Productos agotados</p>
                    </div>
                    <div className="bg-white rounded-xl border border-orange-200 px-5 py-4 shadow-sm">
                        <p className="text-xs font-semibold text-orange-500 mb-1">Stock critico</p>
                        <p className="text-2xl font-black text-orange-600">{contadores.critico}</p>
                        <p className="text-xs text-gray-400 mt-1">Bajo el minimo</p>
                    </div>
                    <div className="bg-white rounded-xl border border-yellow-200 px-5 py-4 shadow-sm">
                        <p className="text-xs font-semibold text-yellow-600 mb-1">Advertencia</p>
                        <p className="text-2xl font-black text-yellow-600">{contadores.advertencia}</p>
                        <p className="text-xs text-gray-400 mt-1">Se agotan en 7 dias</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 px-6 py-4 mb-6 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                            <Bell size={22} className="text-red-600" />
                        </div>
                        <div>
                            <h2 className="font-bold text-cixoil-red text-lg">Alertas del sistema</h2>
                            <p className="text-sm text-gray-500">Prediccion inteligente de agotamiento de stock</p>
                        </div>
                    </div>
                    {!loading && (
                        <div className="flex items-center gap-2 text-red-600 font-semibold text-sm">
                            <TriangleAlert size={16} />
                            {alertas.length} alertas activas
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 mb-4">
                    {["todos", "agotado", "critico", "advertencia"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFiltro(f)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                filtro === f
                                    ? "bg-cixoil-red text-white"
                                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            {f === "todos" ? "Todos" :
                             f === "agotado" ? "Sin stock" :
                             f === "critico" ? "Stock critico" : "Advertencia"}
                        </button>
                    ))}
                </div>

                <AlertasTabla alertas={alertasFiltradas} loading={loading} />
            </div>
        </div>
    );
}
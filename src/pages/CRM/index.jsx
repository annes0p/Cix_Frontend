import { DollarSign, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import {
    construirCRM,
    getClientes,
    getVentas,
} from "../../services/crmService";
import CRMDetalle from "./CRMDetalle";
import CRMTabla from "./CRMTabla";

export default function CRM() {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [filtro, setFiltro] = useState("todos");

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [clientesData, ventasData] = await Promise.all([
                getClientes(),
                getVentas(),
            ]);
            const crm = construirCRM(clientesData, ventasData);
            setClientes(crm);
        } catch (error) {
            console.error("Error al cargar CRM:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const clientesFiltrados =
        filtro === "todos"
            ? clientes
            : clientes.filter((c) => c.segmento === filtro);

    const totalFrecuentes = clientes.filter(
        (c) => c.segmento === "Frecuente",
    ).length;
    const totalGastado = clientes.reduce((acc, c) => acc + c.totalGastado, 0);
    const totalCompras = clientes.reduce((acc, c) => acc + c.frecuencia, 0);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-cixoil-red">CRM</h1>
                    <p className="text-sm text-gray-500">
                        Gestion de relaciones con clientes
                    </p>
                </div>
                <span className="text-sm font-medium text-gray-600">
                    CIXOIL S.A.C.
                </span>
            </div>

            <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-gray-500">
                                Total clientes
                            </p>
                            <Users size={18} className="text-cixoil-red" />
                        </div>
                        <p className="text-2xl font-black text-gray-900">
                            {clientes.length}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            Registrados en el sistema
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-green-200 px-5 py-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-cixoil-green">
                                Frecuentes
                            </p>
                            <TrendingUp
                                size={18}
                                className="text-cixoil-green"
                            />
                        </div>
                        <p className="text-2xl font-black text-cixoil-green">
                            {totalFrecuentes}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            2 o mas compras
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-gray-500">
                                Total facturado
                            </p>
                            <DollarSign size={18} className="text-cixoil-red" />
                        </div>
                        <p className="text-2xl font-black text-gray-900">
                            S/. {totalGastado.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            {totalCompras} compras en total
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
                    {["todos", "Frecuente", "Ocasional", "Nuevo"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFiltro(f)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                                filtro === f
                                    ? "bg-cixoil-red text-white"
                                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            {f === "todos" ? "Todos" : f}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <CRMTabla
                            clientes={clientesFiltrados}
                            loading={loading}
                            onSeleccionar={setClienteSeleccionado}
                            clienteSeleccionado={clienteSeleccionado}
                        />
                    </div>
                    <div>
                        <CRMDetalle cliente={clienteSeleccionado} />
                    </div>
                </div>
            </div>
        </div>
    );
}

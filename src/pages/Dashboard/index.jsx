import { Calendar, Loader2, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { dashboardService } from "../../services/dashboardService";
import ChartsSection from "./components/ChartsSection";
import MatricsGrid from "./components/MatricsGrid";
import Navbar from "./components/Navbar";
import Rentabilidad from "./components/Rentabilidad";
import StockCritico from "./components/StockCritico";
import TopProducts from "./components/TopProducts";
import UltimasVentas from "./components/UltimasVentas";

export default function Dashboard() {
    const [empresa, setEmpresa] = useState("CIXOIL S.A.C.");
    const [inventario, setInventario] = useState([]);
    const [movimientos, setMovimientos] = useState([]);
    const [ventas, setVentas] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [inv, mov, ven, cli] = await Promise.all([
                dashboardService.getInventario(),
                dashboardService.getMovimientos(),
                dashboardService.getVentas(),
                dashboardService.getClientes(),
            ]);
            setInventario(inv);
            setMovimientos(mov);
            setVentas(ven);
            setClientes(cli);
        } catch (err) {
            setError("No se pudieron cargar algunos datos.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const stockCritico = inventario.filter((i) => i.stock <= i.minStock);
    const totalProductos = inventario.length;
    const totalClientes = clientes.length;
    const totalVentas = ventas.length;
    const totalMovimientos = movimientos.length;

    return (
        <div className="min-h-screen w-full flex bg-slate-50/50 font-sans antialiased">
            <div className="flex-1 flex flex-col min-w-0">
                <Navbar currentCompany={empresa} onChangeCompany={setEmpresa} />
                <main className="p-6 space-y-6 overflow-y-auto w-full max-w-[1600px] mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Calendar size={16} className="text-gray-400" />
                            <span>
                                Panel de control —{" "}
                                {new Date().toLocaleDateString("es-PE", {
                                    dateStyle: "long",
                                })}
                            </span>
                        </div>
                        <button
                            onClick={fetchData}
                            disabled={loading}
                            className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
                        >
                            <RefreshCw
                                size={16}
                                className={loading ? "animate-spin" : ""}
                            />
                            Actualizar datos
                        </button>
                    </div>

                    {error && (
                        <div className="p-3.5 bg-red-50 border-l-4 border-cixoil-red text-cixoil-red rounded-r-xl text-xs font-semibold">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="h-96 w-full flex flex-col items-center justify-center gap-3 text-gray-400 font-medium bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <Loader2 className="w-8 h-8 animate-spin text-cixoil-red" />
                            <p className="text-sm animate-pulse">
                                Sincronizando con base de datos de CIXOIL...
                            </p>
                        </div>
                    ) : (
                        <>
                            <MatricsGrid
                                totalProductos={totalProductos}
                                totalClientes={totalClientes}
                                totalVentas={totalVentas}
                                totalMovimientos={totalMovimientos}
                                stockCritico={stockCritico.length}
                            />

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2">
                                    <ChartsSection
                                        movimientos={movimientos}
                                        ventas={ventas}
                                    />
                                </div>
                                <div>
                                    <TopProducts inventario={inventario} />
                                </div>
                            </div>

                            <Rentabilidad ventas={ventas} />

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <StockCritico stockCritico={stockCritico} />
                                <UltimasVentas ventas={ventas} />
                            </div>
                        </>
                    )}

                    <footer className="flex items-center justify-between text-[11px] font-medium text-gray-400 pt-2 border-t border-gray-200/60">
                        <div className="flex items-center gap-2">
                            <span
                                className={`w-2 h-2 rounded-full ${loading ? "bg-amber-500 animate-pulse" : "bg-emerald-500 animate-pulse"}`}
                            />
                            <span>
                                {loading
                                    ? "Consultando..."
                                    : "Sincronizacion automatica activada"}
                            </span>
                            <span className="text-gray-300">|</span>
                            <span>
                                Ultima actualizacion:{" "}
                                {new Date().toLocaleTimeString()}
                            </span>
                        </div>
                    </footer>
                </main>
            </div>
        </div>
    );
}

import { BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import {
    getReportesCompras,
    getReportesInventario,
    getReportesMovimientos,
} from "../../services/reportesService";
import ReportesFiltros from "./ReportesFiltros";
import ReportesTabla from "./ReportesTabla";
export default function Reportes() {
    const [reportes, setReportes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tipoActivo, setTipoActivo] = useState("Inventario");
    const cargarReportes = async (tipo) => {
        try {
            setLoading(true);
            let data = [];
            if (tipo === "Inventario") data = await getReportesInventario();
            else if (tipo === "Movimientos")
                data = await getReportesMovimientos();
            else if (tipo === "Compras") data = await getReportesCompras();
            setReportes(data);
        } catch (error) {
            console.error("Error al cargar reportes:", error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        cargarReportes(tipoActivo);
    }, [tipoActivo]);
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
                <h1 className="text-xl font-bold text-cixoil-red">Reportes</h1>
                <p className="text-sm text-gray-500">
                    Consulta y generación de reportes
                </p>
            </div>
            <div className="p-4 sm:p-6">
                <div className="bg-white rounded-xl border border-gray-200 px-4 sm:px-6 py-4 mb-6 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                        <BarChart3 size={22} className="text-blue-600" />
                    </div>
                    <div>
                        <h2 className="font-bold text-cixoil-red text-lg">
                            Reportes del sistema
                        </h2>
                        <p className="text-sm text-gray-500">
                            Consulta de datos por módulo
                        </p>
                    </div>
                </div>
                <ReportesFiltros
                    tipoActivo={tipoActivo}
                    onCambiarTipo={setTipoActivo}
                />
                <ReportesTabla
                    reportes={reportes}
                    loading={loading}
                    tipo={tipoActivo}
                />
            </div>
        </div>
    );
}

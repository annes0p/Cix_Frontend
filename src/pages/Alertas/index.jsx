import { Bell, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { getAlertas } from "../../services/alertasService";
import AlertasTabla from "./AlertasTabla";

export default function Alertas() {
    const [alertas, setAlertas] = useState([]);
    const [loading, setLoading] = useState(true);

    const cargarAlertas = async () => {
        try {
            setLoading(true);
            const data = await getAlertas();
            const criticos = data.filter(
                (item) =>
                    item.stock <= item.minStock ||
                    item.quantity <= item.minimumStock,
            );
            setAlertas(criticos);
        } catch (error) {
            console.error("Error al cargar alertas:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarAlertas();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-cixoil-red">
                        Alertas
                    </h1>
                    <p className="text-sm text-gray-500">
                        Monitoreo de incidencias y stock crítico
                    </p>
                </div>
                <span className="text-sm font-medium text-gray-600">
                    CIXOIL S.A.C.
                </span>
            </div>

            <div className="p-6">
                <div className="bg-white rounded-xl border border-gray-200 px-6 py-4 mb-6 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                            <Bell size={22} className="text-red-600" />
                        </div>
                        <div>
                            <h2 className="font-bold text-cixoil-red text-lg">
                                Alertas del sistema
                            </h2>
                            <p className="text-sm text-gray-500">
                                Productos con stock crítico o agotados
                            </p>
                        </div>
                    </div>
                    {!loading && (
                        <div className="flex items-center gap-2 text-red-600 font-semibold text-sm">
                            <TriangleAlert size={16} />
                            {alertas.length} alertas activas
                        </div>
                    )}
                </div>

                <AlertasTabla alertas={alertas} loading={loading} />
            </div>
        </div>
    );
}

import { Plus, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { getOrdenes } from "../../services/ordenesService";
import ModalNuevaOrden from "./ModalNuevaOrden";
import OrdenesTabla from "./OrdenesTabla";

export default function OrdenesCompra() {
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const cargarOrdenes = async () => {
        try {
            setLoading(true);
            const data = await getOrdenes();
            setOrdenes(data);
        } catch (error) {
            console.error("Error al cargar órdenes:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarOrdenes();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-cixoil-red">
                        Órdenes de Compra
                    </h1>
                    <p className="text-sm text-gray-500">
                        Gestión de compras y abastecimiento
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-cixoil-green text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium"
                >
                    <Plus size={16} />
                    Nueva Orden
                </button>
            </div>

            <div className="p-4 sm:p-6">
                <div className="bg-white rounded-xl border border-gray-200 px-4 sm:px-6 py-4 mb-6 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                        <ShoppingCart size={22} className="text-cixoil-green" />
                    </div>
                    <div>
                        <h2 className="font-bold text-cixoil-red text-lg">
                            Órdenes registradas
                        </h2>
                        <p className="text-sm text-gray-500">
                            Control y seguimiento de compras
                        </p>
                    </div>
                </div>

                <OrdenesTabla
                    ordenes={ordenes}
                    loading={loading}
                    onRecargar={cargarOrdenes}
                />
            </div>

            {showModal && (
                <ModalNuevaOrden
                    onClose={() => setShowModal(false)}
                    onGuardar={cargarOrdenes}
                />
            )}
        </div>
    );
}

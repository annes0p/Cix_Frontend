import { Plus, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { getProveedores } from "../../services/proveedoresService";
import ModalProveedor from "./ModalProveedor";
import ProveedoresTabla from "./ProveedoresTabla";

export default function Proveedores() {
    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const cargarProveedores = async () => {
        try {
            setLoading(true);
            const data = await getProveedores();
            setProveedores(data);
        } catch (error) {
            console.error("Error al cargar proveedores:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarProveedores();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-cixoil-red">
                        Proveedores
                    </h1>
                    <p className="text-sm text-gray-500">
                        Gestión de proveedores registrados
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-cixoil-green text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium"
                >
                    <Plus size={16} />
                    Nuevo proveedor
                </button>
            </div>

            <div className="p-4 sm:p-6">
                <div className="bg-white rounded-xl border border-gray-200 px-4 sm:px-6 py-4 mb-6 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                        <Truck size={22} className="text-cixoil-green" />
                    </div>
                    <div>
                        <h2 className="font-bold text-cixoil-red text-lg">
                            Registro de proveedores
                        </h2>
                        <p className="text-sm text-gray-500">
                            Administración y control de proveedores
                        </p>
                    </div>
                </div>

                <ProveedoresTabla
                    proveedores={proveedores}
                    loading={loading}
                    onRecargar={cargarProveedores}
                />
            </div>

            {showModal && (
                <ModalProveedor
                    onClose={() => setShowModal(false)}
                    onGuardar={cargarProveedores}
                />
            )}
        </div>
    );
}

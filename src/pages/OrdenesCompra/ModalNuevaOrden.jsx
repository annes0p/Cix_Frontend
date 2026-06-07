import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { crearOrden } from "../../services/ordenesService";
import { getProveedores } from "../../services/proveedoresService";

export default function ModalNuevaOrden({ onClose, onGuardar }) {
    const [form, setForm] = useState({
        supplierId: "",
        purchaseDate: "",
        totalAmount: "",
        status: "Pendiente",
    });
    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarProveedores = async () => {
            try {
                const data = await getProveedores();
                setProveedores(data);
            } catch (err) {
                console.error("Error al cargar proveedores:", err);
            }
        };
        cargarProveedores();
    }, []);

    const handleChange = (campo, valor) => {
        setForm((prev) => ({ ...prev, [campo]: valor }));
    };

    const guardar = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);
            await crearOrden({
                ...form,
                totalAmount: Number(form.totalAmount),
            });
            onGuardar();
            onClose();
        } catch (err) {
            setError("Error al guardar la orden. Intenta de nuevo.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cixoil-red";

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                <div className="flex justify-between items-center px-6 py-4 border-b">
                    <div>
                        <h2 className="font-bold text-lg">
                            Nueva Orden de Compra
                        </h2>
                        <p className="text-sm text-gray-500">
                            Registra una nueva compra
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X />
                    </button>
                </div>

                <form onSubmit={guardar} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Proveedor
                        </label>
                        <select
                            className={inputClass}
                            value={form.supplierId}
                            onChange={(e) =>
                                handleChange("supplierId", e.target.value)
                            }
                            required
                        >
                            <option value="">Seleccionar proveedor</option>
                            {proveedores.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.razonSocial || p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Fecha
                        </label>
                        <input
                            type="date"
                            className={inputClass}
                            value={form.purchaseDate}
                            onChange={(e) =>
                                handleChange("purchaseDate", e.target.value)
                            }
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Total (S/.)
                        </label>
                        <input
                            type="number"
                            min="0"
                            className={inputClass}
                            value={form.totalAmount}
                            onChange={(e) =>
                                handleChange("totalAmount", e.target.value)
                            }
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Estado
                        </label>
                        <select
                            className={inputClass}
                            value={form.status}
                            onChange={(e) =>
                                handleChange("status", e.target.value)
                            }
                        >
                            <option>Pendiente</option>
                            <option>Aprobada</option>
                            <option>Recibida</option>
                            <option>Cancelada</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 border border-gray-300 rounded-lg py-2.5 text-sm"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-cixoil-red text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
                        >
                            {loading ? "Guardando..." : "Guardar Orden"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

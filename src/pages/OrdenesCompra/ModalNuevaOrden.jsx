import { Minus, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { crearOrden } from "../../services/ordenesService";
import { getProveedores } from "../../services/proveedoresService";

export default function ModalNuevaOrden({ onClose, onGuardar }) {
    const [form, setForm] = useState({
        idSupplier: "",
        purchasedAt: "",
        estimatedDeliveryAt: "",
        deliveredAt: "",
        receptionStatus: "PENDING",
        details: [],
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

    const agregarDetalle = () => {
        setForm((prev) => ({
            ...prev,
            details: [...prev.details, { idProduct: "", quantity: 1 }],
        }));
    };

    const actualizarDetalle = (index, campo, valor) => {
        setForm((prev) => {
            const nuevos = [...prev.details];
            nuevos[index] = { ...nuevos[index], [campo]: valor };
            return { ...prev, details: nuevos };
        });
    };

    const eliminarDetalle = (index) => {
        setForm((prev) => ({
            ...prev,
            details: prev.details.filter((_, i) => i !== index),
        }));
    };

    const guardar = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);
            await crearOrden({
                ...form,
                idSupplier: Number(form.idSupplier),
                details: form.details.map((d) => ({
                    idProduct: Number(d.idProduct),
                    quantity: Number(d.quantity),
                })),
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
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
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
                            value={form.idSupplier}
                            onChange={(e) =>
                                handleChange("idSupplier", e.target.value)
                            }
                            required
                        >
                            <option value="">Seleccionar proveedor</option>
                            {proveedores.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.legalName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Fecha de compra
                        </label>
                        <input
                            type="date"
                            className={inputClass}
                            value={form.purchasedAt}
                            onChange={(e) =>
                                handleChange("purchasedAt", e.target.value)
                            }
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Entrega estimada
                        </label>
                        <input
                            type="date"
                            className={inputClass}
                            value={form.estimatedDeliveryAt}
                            onChange={(e) =>
                                handleChange(
                                    "estimatedDeliveryAt",
                                    e.target.value,
                                )
                            }
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Estado
                        </label>
                        <select
                            className={inputClass}
                            value={form.receptionStatus}
                            onChange={(e) =>
                                handleChange("receptionStatus", e.target.value)
                            }
                        >
                            <option value="PENDING">Pendiente</option>
                            <option value="PARTIALLY_RECIEVED">
                                Recibido parcialmente
                            </option>
                            <option value="RECIEVED">Recibido</option>
                        </select>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-gray-600">
                                Productos
                            </label>
                            <button
                                type="button"
                                onClick={agregarDetalle}
                                className="flex items-center gap-1 text-xs text-cixoil-green font-medium"
                            >
                                <Plus size={14} />
                                Agregar producto
                            </button>
                        </div>
                        {form.details.length === 0 && (
                            <p className="text-xs text-gray-400 text-center py-2">
                                No hay productos agregados.
                            </p>
                        )}
                        {form.details.map((detalle, index) => (
                            <div key={index} className="flex gap-2 mb-2">
                                <input
                                    type="number"
                                    placeholder="ID producto"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cixoil-red"
                                    value={detalle.idProduct}
                                    onChange={(e) =>
                                        actualizarDetalle(
                                            index,
                                            "idProduct",
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Cantidad"
                                    min="1"
                                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cixoil-red"
                                    value={detalle.quantity}
                                    onChange={(e) =>
                                        actualizarDetalle(
                                            index,
                                            "quantity",
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => eliminarDetalle(index)}
                                    className="text-red-400 hover:text-red-600"
                                >
                                    <Minus size={16} />
                                </button>
                            </div>
                        ))}
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

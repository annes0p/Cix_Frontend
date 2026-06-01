import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { actualizarMovimiento } from "../../services/movimientosService";

export default function ModalEditarMovimiento({
    mov,
    onClose,
    onMovimientoActualizado,
}) {
    const [form, setForm] = useState({
        cliente: "",
        nit: "",
        telefono: "",
        estado: "",
        condicionPago: "",
        direccionEntrega: "",
        vendedor: "",
        tipo: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (mov) {
            setForm({
                cliente: mov.cliente || "",
                nit: mov.nit || "",
                telefono: mov.telefono || "",
                estado: mov.estado || "",
                condicionPago: mov.condicionPago || "",
                direccionEntrega: mov.direccionEntrega || "",
                vendedor: mov.vendedor || "",
                tipo: mov.tipo || "",
            });
        }
    }, [mov]);

    const handleChange = (campo, valor) =>
        setForm((prev) => ({ ...prev, [campo]: valor }));

    const handleGuardar = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const actualizado = await actualizarMovimiento(mov.id, form);
            onMovimientoActualizado({ ...mov, ...form });
        } catch {
            onMovimientoActualizado({ ...mov, ...form });
        } finally {
            setLoading(false);
            onClose();
        }
    };

    const inputClass =
        "w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cixoil-red focus:border-transparent transition-all placeholder:text-gray-400";
    const labelClass =
        "block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            Editar movimiento
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {mov?.id}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleGuardar} className="px-6 py-5 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        {["Venta", "Pedido"].map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => handleChange("tipo", t)}
                                className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                                    form.tipo === t
                                        ? "bg-cixoil-red text-white border-cixoil-red"
                                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className={labelClass}>Cliente *</label>
                            <input
                                type="text"
                                className={inputClass}
                                value={form.cliente}
                                onChange={(e) =>
                                    handleChange("cliente", e.target.value)
                                }
                                required
                            />
                        </div>
                        <div>
                            <label className={labelClass}>NIT</label>
                            <input
                                type="text"
                                className={inputClass}
                                value={form.nit}
                                onChange={(e) =>
                                    handleChange("nit", e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Teléfono</label>
                            <input
                                type="text"
                                className={inputClass}
                                value={form.telefono}
                                onChange={(e) =>
                                    handleChange("telefono", e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Estado</label>
                            <select
                                className={inputClass}
                                value={form.estado}
                                onChange={(e) =>
                                    handleChange("estado", e.target.value)
                                }
                            >
                                <option>Pendiente</option>
                                <option>En proceso</option>
                                <option>Completado</option>
                                <option>Cancelado</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>
                                Condición de pago
                            </label>
                            <select
                                className={inputClass}
                                value={form.condicionPago}
                                onChange={(e) =>
                                    handleChange(
                                        "condicionPago",
                                        e.target.value,
                                    )
                                }
                            >
                                <option>Contado</option>
                                <option>Crédito 30 días</option>
                                <option>Crédito 60 días</option>
                                <option>Crédito 90 días</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Vendedor</label>
                            <input
                                type="text"
                                className={inputClass}
                                value={form.vendedor}
                                onChange={(e) =>
                                    handleChange("vendedor", e.target.value)
                                }
                            />
                        </div>
                        <div className="col-span-2">
                            <label className={labelClass}>
                                Dirección de entrega
                            </label>
                            <input
                                type="text"
                                className={inputClass}
                                value={form.direccionEntrega}
                                onChange={(e) =>
                                    handleChange(
                                        "direccionEntrega",
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-cixoil-red text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
                        >
                            {loading ? "Guardando..." : "Guardar cambios"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

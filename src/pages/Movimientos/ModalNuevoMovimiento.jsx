import { Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { crearMovimiento } from "../../services/movimientosService";

const productoVacio = () => ({
    nombre: "",
    descripcion: "",
    cantidad: 1,
    precio: 0,
});

export default function ModalNuevoMovimiento({ onClose, onMovimientoCreado }) {
    const [tipo, setTipo] = useState("Venta");
    const [form, setForm] = useState({
        cliente: "",
        nit: "",
        telefono: "",
        estado: "Pendiente",
        condicionPago: "Contado",
        direccionEntrega: "",
        vendedor: "",
    });
    const [productos, setProductos] = useState([productoVacio()]);
    const [guardando, setGuardando] = useState(false);

    const subtotal = productos.reduce((s, p) => s + p.cantidad * p.precio, 0);
    const iva = Math.round(subtotal * 0.19);
    const total = subtotal + iva;

    const cambiarForm = (campo, valor) =>
        setForm((prev) => ({ ...prev, [campo]: valor }));

    const cambiarProducto = (i, campo, valor) =>
        setProductos((prev) =>
            prev.map((p, idx) => (idx === i ? { ...p, [campo]: valor } : p)),
        );

    const agregarProducto = () =>
        setProductos((prev) => [...prev, productoVacio()]);

    const eliminarProducto = (i) => {
        if (productos.length === 1) return;
        setProductos((prev) => prev.filter((_, idx) => idx !== i));
    };

    const handleGuardar = async () => {
        setGuardando(true);
        try {
            const data = {
                ...form,
                tipo,
                productos,
                subtotal,
                iva,
                total,
                fecha: new Date().toISOString(),
            };
            const nuevo = await crearMovimiento(data);
            onMovimientoCreado(nuevo);
        } catch {
            const nuevo = {
                id: `${tipo === "Venta" ? "VTA" : "PED"}-${String(Date.now()).slice(-6)}`,
                factura: null,
                ...form,
                tipo,
                productos,
                subtotal,
                iva,
                total,
                fecha: new Date().toISOString(),
            };
            onMovimientoCreado(nuevo);
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">
                        Nuevo pedido / venta
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-700 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Cuerpo */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                    {/* Tipo */}
                    <div className="flex gap-3">
                        {["Venta", "Pedido"].map((t) => (
                            <button
                                key={t}
                                onClick={() => setTipo(t)}
                                className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                                    tipo === t
                                        ? "bg-cixoil-red text-white border-cixoil-red"
                                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    {/* Campos */}
                    <div className="grid grid-cols-2 gap-4">
                        <Campo
                            label="Cliente *"
                            value={form.cliente}
                            onChange={(v) => cambiarForm("cliente", v)}
                            placeholder="Nombre empresa"
                        />
                        <Campo
                            label="NIT"
                            value={form.nit}
                            onChange={(v) => cambiarForm("nit", v)}
                            placeholder="900.000.000-0"
                        />
                        <Campo
                            label="Teléfono"
                            value={form.telefono}
                            onChange={(v) => cambiarForm("telefono", v)}
                            placeholder="300 000 0000"
                        />
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                Estado
                            </label>
                            <select
                                value={form.estado}
                                onChange={(e) =>
                                    cambiarForm("estado", e.target.value)
                                }
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-cixoil-red transition-colors"
                            >
                                <option>Pendiente</option>
                                <option>En proceso</option>
                                <option>Completado</option>
                                <option>Cancelado</option>
                            </select>
                        </div>
                        <Campo
                            label="Vendedor"
                            value={form.vendedor}
                            onChange={(v) => cambiarForm("vendedor", v)}
                            placeholder="Nombre del vendedor"
                        />
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                Condición de pago
                            </label>
                            <select
                                value={form.condicionPago}
                                onChange={(e) =>
                                    cambiarForm("condicionPago", e.target.value)
                                }
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-cixoil-red transition-colors"
                            >
                                <option>Contado</option>
                                <option>Crédito 30 días</option>
                                <option>Crédito 60 días</option>
                                <option>Crédito 90 días</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                Dirección de entrega
                            </label>
                            <input
                                value={form.direccionEntrega}
                                onChange={(e) =>
                                    cambiarForm(
                                        "direccionEntrega",
                                        e.target.value,
                                    )
                                }
                                placeholder="Calle, ciudad, departamento"
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-cixoil-red transition-colors placeholder:text-gray-300"
                            />
                        </div>
                    </div>

                    {/* Productos */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-gray-700">
                                Productos
                            </h3>
                            <button
                                onClick={agregarProducto}
                                className="flex items-center gap-1 text-xs text-cixoil-red font-medium hover:opacity-80 transition-opacity"
                            >
                                <Plus size={14} /> Agregar
                            </button>
                        </div>
                        <div className="space-y-2">
                            {productos.map((p, i) => (
                                <div
                                    key={i}
                                    className="grid grid-cols-12 gap-2 items-end"
                                >
                                    <div className="col-span-4">
                                        {i === 0 && (
                                            <label className="block text-xs text-gray-500 mb-1">
                                                Producto
                                            </label>
                                        )}
                                        <input
                                            value={p.nombre}
                                            onChange={(e) =>
                                                cambiarProducto(
                                                    i,
                                                    "nombre",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Nombre"
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cixoil-red"
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        {i === 0 && (
                                            <label className="block text-xs text-gray-500 mb-1">
                                                Descripción
                                            </label>
                                        )}
                                        <input
                                            value={p.descripcion}
                                            onChange={(e) =>
                                                cambiarProducto(
                                                    i,
                                                    "descripcion",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Ej: Galón"
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cixoil-red"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        {i === 0 && (
                                            <label className="block text-xs text-gray-500 mb-1">
                                                Cant.
                                            </label>
                                        )}
                                        <input
                                            type="number"
                                            min="1"
                                            value={p.cantidad}
                                            onChange={(e) =>
                                                cambiarProducto(
                                                    i,
                                                    "cantidad",
                                                    Number(e.target.value),
                                                )
                                            }
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cixoil-red"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        {i === 0 && (
                                            <label className="block text-xs text-gray-500 mb-1">
                                                Precio
                                            </label>
                                        )}
                                        <input
                                            type="number"
                                            min="0"
                                            value={p.precio}
                                            onChange={(e) =>
                                                cambiarProducto(
                                                    i,
                                                    "precio",
                                                    Number(e.target.value),
                                                )
                                            }
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cixoil-red"
                                        />
                                    </div>
                                    <div className="col-span-1 flex justify-center">
                                        {i === 0 && (
                                            <div className="mb-1 h-4" />
                                        )}
                                        <button
                                            onClick={() => eliminarProducto(i)}
                                            disabled={productos.length === 1}
                                            className="text-gray-300 hover:text-red-500 transition-colors disabled:opacity-30"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Totales */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-1.5 text-sm">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span>$ {subtotal.toLocaleString("es-CO")}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>IVA (19%)</span>
                            <span>$ {iva.toLocaleString("es-CO")}</span>
                        </div>
                        <div className="flex justify-between font-bold text-base text-cixoil-red border-t border-gray-200 pt-1.5">
                            <span>Total</span>
                            <span>$ {total.toLocaleString("es-CO")}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleGuardar}
                        disabled={guardando || !form.cliente}
                        className="px-5 py-2.5 bg-cixoil-red text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {guardando ? "Guardando..." : "Guardar"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function Campo({ label, value, onChange, placeholder }) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
                {label}
            </label>
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-cixoil-red transition-colors placeholder:text-gray-300"
            />
        </div>
    );
}

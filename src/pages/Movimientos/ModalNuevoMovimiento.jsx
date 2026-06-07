import { Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { crearSale } from "../../services/movimientosService";

const getLocalDateTime = () => { const now = new Date(); now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); return now.toISOString().slice(0, 16); };
const HOY = getLocalDateTime();

export default function ModalNuevoMovimiento({ onClose, onMovimientoCreado }) {
    const [form, setForm] = useState({
        voucherType: "SALE_NOTE",
        series: "VTA",
        paymentMethod: "CASH",
        transactionStatus: "PENDING",
        idClient: "",
        saleDate: HOY,
    });
    const [detalles, setDetalles] = useState([{ idProduct: "", quantity: 1 }]);
    const [clientes, setClientes] = useState([]);
    const [productos, setProductos] = useState([]);
    const [inventario, setInventario] = useState([]);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargar = async () => {
            try {
                const [cliRes, prodRes, invRes] = await Promise.all([
                    api.get("/clients"),
                    api.get("/products"),
                    api.get("/inventory"),
                ]);
                setClientes(cliRes.data?.data || cliRes.data || []);
                setProductos(prodRes.data?.data || prodRes.data || []);
                setInventario(invRes.data?.data || invRes.data || []);
            } catch {
                setClientes([]);
                setProductos([]);
                setInventario([]);
            }
        };
        cargar();
    }, []);

    const cambiarForm = (campo, valor) =>
        setForm((prev) => ({ ...prev, [campo]: valor }));

    const cambiarDetalle = (i, campo, valor) =>
        setDetalles((prev) =>
            prev.map((d, idx) => (idx === i ? { ...d, [campo]: valor } : d))
        );

    const agregarDetalle = () =>
        setDetalles((prev) => [...prev, { idProduct: "", quantity: 1 }]);

    const eliminarDetalle = (i) => {
        if (detalles.length === 1) return;
        setDetalles((prev) => prev.filter((_, idx) => idx !== i));
    };

    const precioProducto = (idProduct) => {
        const p = productos.find((p) => String(p.id) === String(idProduct));
        return p ? Number(p.price) : 0;
    };

    const stockProducto = (idProduct) => {
        const inv = inventario.find((i) => String(i.product?.id) === String(idProduct));
        return inv ? Number(inv.stock ?? inv.currentStock ?? 0) : null;
    };

    const subtotal = detalles.reduce(
        (s, d) => s + precioProducto(d.idProduct) * Number(d.quantity || 0),
        0
    );
    const iva = Math.round(subtotal * 0.19);
    const total = subtotal + iva;

    const usuarioActual = JSON.parse(localStorage.getItem("user") || "{}");

    const handleGuardar = async () => {
        if (!form.idClient) {
            setError("Selecciona un cliente");
            return;
        }
        if (detalles.some((d) => !d.idProduct)) {
            setError("Selecciona un producto en cada fila");
            return;
        }
        if (detalles.some((d) => Number(d.quantity) < 1)) {
            setError("La cantidad debe ser mayor a 0");
            return;
        }
        const fechaSeleccionada = new Date(form.saleDate);
        const ahora = new Date();
        ahora.setHours(0, 0, 0, 0);
        if (fechaSeleccionada < ahora) {
            setError("La fecha no puede ser anterior a hoy");
            return;
        }
        for (const d of detalles) {
            const stock = stockProducto(d.idProduct);
            if (stock !== null && Number(d.quantity) > stock) {
                const prod = productos.find((p) => String(p.id) === String(d.idProduct));
                setError(`Stock insuficiente para "${prod?.name}" — disponible: ${stock}`);
                return;
            }
        }
        setError(null);
        setGuardando(true);
        try {
            const payload = {
                saleDate: new Date(form.saleDate).toISOString().replace("Z", ""),
                voucherType: form.voucherType,
                series: form.series,
                paymentMethod: form.paymentMethod,
                transactionStatus: form.transactionStatus,
                idClient: Number(form.idClient),
                idUser: usuarioActual?.id || 1,
                details: detalles.map((d) => ({
                    idProduct: Number(d.idProduct),
                    quantity: Number(d.quantity),
                })),
            };
            const nuevo = await crearSale(payload);
            onMovimientoCreado(nuevo);
            onClose();
        } catch (err) {
            const msg = err?.response?.data?.message || "Error al guardar la venta. Intenta de nuevo.";
            setError(msg);
        } finally {
            setGuardando(false);
        }
    };

    const inputClass =
        "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-cixoil-red transition-colors";
    const labelClass = "block text-xs font-medium text-gray-600 mb-1";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">Nueva venta</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className={labelClass}>Cliente *</label>
                            <select
                                value={form.idClient}
                                onChange={(e) => cambiarForm("idClient", e.target.value)}
                                className={inputClass}
                            >
                                <option value="">Seleccionar cliente</option>
                                {clientes.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {`${c.name} ${c.fatherLastName || ""} ${c.motherLastName || ""}`.trim()} - {c.docNumber || `ID-${c.id}`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className={labelClass}>Tipo de comprobante</label>
                            <select value={form.voucherType} onChange={(e) => cambiarForm("voucherType", e.target.value)} className={inputClass}>
                                <option value="SALE_NOTE">Nota de venta</option>
                                <option value="INVOICE">Factura</option>
                                <option value="RECEIPT">Boleta</option>
                            </select>
                        </div>

                        <div>
                            <label className={labelClass}>Serie</label>
                            <input
                                type="text"
                                value={form.series}
                                onChange={(e) => cambiarForm("series", e.target.value)}
                                placeholder="Ej: VTA"
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Metodo de pago</label>
                            <select value={form.paymentMethod} onChange={(e) => cambiarForm("paymentMethod", e.target.value)} className={inputClass}>
                                <option value="CASH">Efectivo</option>
                                <option value="YAPE">Yape</option>
                                <option value="CARD">Tarjeta</option>
                                <option value="TRANSFER">Transferencia</option>
                            </select>
                        </div>

                        <div>
                            <label className={labelClass}>Estado</label>
                            <select value={form.transactionStatus} onChange={(e) => cambiarForm("transactionStatus", e.target.value)} className={inputClass}>
                                <option value="PENDING">Pendiente</option>
                                <option value="COMPLETED">Pagada</option>
                                <option value="CANCELED">Anulada</option>
                            </select>
                        </div>

                        <div className="col-span-2">
                            <label className={labelClass}>Fecha y hora</label>
                            <input
                                type="datetime-local"
                                value={form.saleDate}
                                min={HOY}
                                max={new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 16)}
                                onChange={(e) => cambiarForm("saleDate", e.target.value)}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-gray-700">Productos</h3>
                            <button
                                onClick={agregarDetalle}
                                className="flex items-center gap-1 text-xs text-cixoil-red font-medium hover:opacity-80 transition-opacity"
                            >
                                <Plus size={14} /> Agregar
                            </button>
                        </div>
                        <div className="space-y-2">
                            {detalles.map((d, i) => {
                                const stock = stockProducto(d.idProduct);
                                const stockInsuficiente = stock !== null && Number(d.quantity) > stock;
                                return (
                                    <div key={i} className="grid grid-cols-12 gap-2 items-end">
                                        <div className="col-span-6">
                                            {i === 0 && <label className="block text-xs text-gray-500 mb-1">Producto</label>}
                                            <select
                                                value={d.idProduct}
                                                onChange={(e) => cambiarDetalle(i, "idProduct", e.target.value)}
                                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cixoil-red"
                                            >
                                                <option value="">Seleccionar</option>
                                                {productos.map((p) => {
                                                    const s = stockProducto(p.id);
                                                    return (
                                                        <option key={p.id} value={p.id}>
                                                            {p.name} - S/ {Number(p.price).toLocaleString("es-PE")} {s !== null ? `(stock: ${s})` : ""}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                            {d.idProduct && stock !== null && (
                                                <p className={`text-xs mt-0.5 ${stockInsuficiente ? "text-red-500" : "text-gray-400"}`}>
                                                    Stock disponible: {stock}
                                                </p>
                                            )}
                                        </div>
                                        <div className="col-span-2">
                                            {i === 0 && <label className="block text-xs text-gray-500 mb-1">Cant.</label>}
                                            <input
                                                type="number"
                                                min="1"
                                                max={stock || undefined}
                                                value={d.quantity}
                                                onChange={(e) => cambiarDetalle(i, "quantity", e.target.value)}
                                                className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cixoil-red ${stockInsuficiente ? "border-red-300" : "border-gray-200"}`}
                                            />
                                        </div>
                                        <div className="col-span-3">
                                            {i === 0 && <label className="block text-xs text-gray-500 mb-1">Subtotal</label>}
                                            <p className="text-xs text-gray-700 font-medium py-2 text-right">
                                                S/ {(precioProducto(d.idProduct) * Number(d.quantity || 0)).toLocaleString("es-PE")}
                                            </p>
                                        </div>
                                        <div className="col-span-1 flex justify-center">
                                            {i === 0 && <div className="mb-1 h-4" />}
                                            <button
                                                onClick={() => eliminarDetalle(i)}
                                                disabled={detalles.length === 1}
                                                className="text-gray-300 hover:text-red-500 transition-colors disabled:opacity-30"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 space-y-1.5 text-sm">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span>S/ {subtotal.toLocaleString("es-PE")}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>IGV (19%)</span>
                            <span>S/ {iva.toLocaleString("es-PE")}</span>
                        </div>
                        <div className="flex justify-between font-bold text-base text-cixoil-red border-t border-gray-200 pt-1.5">
                            <span>Total</span>
                            <span>S/ {total.toLocaleString("es-PE")}</span>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
                    <button onClick={onClose} className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        Cancelar
                    </button>
                    <button
                        onClick={handleGuardar}
                        disabled={guardando}
                        className="px-5 py-2.5 bg-cixoil-red text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {guardando ? "Guardando..." : "Guardar venta"}
                    </button>
                </div>
            </div>
        </div>
    );
}

import { Calendar, CheckCircle, Circle, DollarSign, Package, Truck, X } from "lucide-react";
import { useState } from "react";
import { recibirOrden, recibirOrdenParcial } from "../../services/ordenesService";

const PASOS = [
    { value: "PENDING", label: "Pendiente", descripcion: "Orden registrada" },
    { value: "PARTIALLY_RECEIVED", label: "Parcial", descripcion: "Recepcion parcial" },
    { value: "RECEIVED", label: "Recibido", descripcion: "Confirmado y cerrado" },
];

const ORDEN_ESTADOS = ["PENDING", "PARTIALLY_RECEIVED", "RECEIVED"];

function TrackerEstado({ estadoActual }) {
    const indiceActual = ORDEN_ESTADOS.indexOf(estadoActual);

    return (
        <div className="pt-4 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-600 mb-4">Seguimiento de orden</p>
            <div className="relative flex items-center justify-between mb-2">
                <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-200 z-0" />
                <div
                    className="absolute left-0 top-4 h-0.5 bg-cixoil-green z-0 transition-all duration-500"
                    style={{ width: `${(indiceActual / (PASOS.length - 1)) * 100}%` }}
                />
                {PASOS.map((paso, index) => {
                    const completado = index < indiceActual;
                    const actual = index === indiceActual;
                    return (
                        <div key={paso.value} className="relative z-10 flex flex-col items-center gap-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                completado ? "bg-cixoil-green border-cixoil-green" :
                                actual ? "bg-white border-cixoil-red" : "bg-white border-gray-300"
                            }`}>
                                {completado ? (
                                    <CheckCircle size={16} className="text-white" />
                                ) : actual ? (
                                    <div className="w-3 h-3 rounded-full bg-cixoil-red" />
                                ) : (
                                    <Circle size={16} className="text-gray-300" />
                                )}
                            </div>
                            <p className={`text-xs font-semibold text-center ${
                                completado ? "text-cixoil-green" : actual ? "text-cixoil-red" : "text-gray-400"
                            }`}>
                                {paso.label}
                            </p>
                            <p className="text-xs text-gray-400 text-center hidden sm:block">
                                {paso.descripcion}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function ModalRecepcionParcial({ orden, onConfirmar, onCancelar, cargando, error }) {
    const [cantidades, setCantidades] = useState(
        Object.fromEntries(
            (orden.details || []).map((d) => [d.product?.id, ""])
        )
    );

    const handleCambio = (idProducto, valor, maxPendiente) => {
        const num = parseInt(valor, 10);
        if (isNaN(num)) {
            setCantidades((prev) => ({ ...prev, [idProducto]: "" }));
            return;
        }
        const acotado = Math.min(Math.max(num, 0), maxPendiente);
        setCantidades((prev) => ({ ...prev, [idProducto]: acotado }));
    };

    const handleConfirmar = () => {
        const items = (orden.details || [])
            .map((d) => ({
                idProduct: d.product?.id,
                quantity: parseInt(cantidades[d.product?.id], 10) || 0,
            }))
            .filter((item) => item.quantity > 0);

        if (!items.length) return;
        onConfirmar(items);
    };

    const todosVacios = (orden.details || []).every(
        (d) => !cantidades[d.product?.id] || cantidades[d.product?.id] === 0
    );

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h3 className="font-bold text-gray-800">Recepcion parcial</h3>
                    <button onClick={onCancelar} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 space-y-3">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}
                    <p className="text-sm text-gray-500 mb-4">
                        Ingresa la cantidad recibida por producto. Deja en 0 los que no llegaron.
                    </p>
                    {(orden.details || []).map((detalle, index) => (
                        <div key={index} className="flex items-center justify-between gap-4 bg-gray-50 rounded-xl px-4 py-3">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate">
                                    {detalle.productName || detalle.product?.name || `Producto #${detalle.product?.id}`}
                                </p>
                                <p className="text-xs text-gray-400">Pedido: {detalle.quantity}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <p className="text-xs text-gray-400">Recibido</p>
                                <input
                                    type="number"
                                    min="0"
                                    max={detalle.quantity}
                                    value={cantidades[detalle.product?.id] ?? ""}
                                    onChange={(e) => handleCambio(detalle.product?.id, e.target.value, detalle.quantity)}
                                    className="w-20 text-center border border-gray-300 rounded-lg px-2 py-1.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-cixoil-red"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="px-6 py-4 border-t space-y-2">
                    <button
                        onClick={handleConfirmar}
                        disabled={cargando || todosVacios}
                        className="w-full bg-cixoil-red text-white rounded-lg py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {cargando ? "Procesando..." : "Confirmar recepcion parcial"}
                    </button>
                    <button
                        onClick={onCancelar}
                        className="w-full border border-gray-300 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ModalDetalleOrden({ orden, onClose, onActualizar }) {
    const [cargando, setCargando] = useState(false);
    const [mostrarParcial, setMostrarParcial] = useState(false);
    const [estadoActual, setEstadoActual] = useState(orden.receptionStatus);
    const [error, setError] = useState(null);
    const [errorParcial, setErrorParcial] = useState(null);

    if (!orden) return null;

    const esPendiente = estadoActual === "PENDING";
    const esParcial = estadoActual === "PARTIALLY_RECEIVED";
    const puedeRecibir = esPendiente || esParcial;

    const handleRecibir = async () => {
        setError(null);
        try {
            setCargando(true);
            await recibirOrden(orden.id);
            setEstadoActual("RECEIVED");
            onActualizar?.();
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    "No se pudo marcar la orden como recibida.",
            );
        } finally {
            setCargando(false);
        }
    };

    const handleConfirmarParcial = async (items) => {
        setErrorParcial(null);
        try {
            setCargando(true);
            await recibirOrdenParcial(orden.id, items);
            setEstadoActual("PARTIALLY_RECEIVED");
            setMostrarParcial(false);
            onActualizar?.();
        } catch (err) {
            setErrorParcial(
                err?.response?.data?.message ||
                    "No se pudo registrar la recepcion parcial.",
            );
        } finally {
            setCargando(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center px-6 py-4 border-b">
                        <div>
                            <h2 className="font-bold text-lg">
                                OC-{orden.id.toString().padStart(4, "0")}
                            </h2>
                            <p className="text-sm text-gray-500">Detalle de orden de compra</p>
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            <X />
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                                <Truck size={18} className="text-cixoil-red shrink-0" />
                                <div>
                                    <p className="text-xs text-gray-400 font-medium">Proveedor</p>
                                    <p className="text-sm font-bold text-gray-800">{orden.supplier?.legalName || "-"}</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                                <DollarSign size={18} className="text-cixoil-green shrink-0" />
                                <div>
                                    <p className="text-xs text-gray-400 font-medium">Total</p>
                                    <p className="text-sm font-black text-cixoil-red">S/. {orden.total || "0.00"}</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                                <Calendar size={18} className="text-gray-400 shrink-0" />
                                <div>
                                    <p className="text-xs text-gray-400 font-medium">Fecha de compra</p>
                                    <p className="text-sm font-bold text-gray-800">{orden.purchasedAt || "-"}</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                                <Calendar size={18} className="text-gray-400 shrink-0" />
                                <div>
                                    <p className="text-xs text-gray-400 font-medium">Entrega estimada</p>
                                    <p className="text-sm font-bold text-gray-800">{orden.estimatedDeliveryAt || "No especificada"}</p>
                                </div>
                            </div>
                        </div>

                        <TrackerEstado estadoActual={estadoActual} />

                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Package size={16} className="text-cixoil-red" />
                                <p className="text-sm font-bold text-gray-800">Productos</p>
                            </div>
                            {!orden.details || orden.details.length === 0 ? (
                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                    <p className="text-xs text-gray-400">Sin detalle de productos</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {orden.details.map((detalle, index) => (
                                        <div key={index} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                                                    {detalle.product?.imageUrl ? (
                                                        <img
                                                            src={detalle.product.imageUrl}
                                                            alt={detalle.product?.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <Package size={16} className="text-gray-300" />
                                                    )}
                                                </div>
                                                <p className="text-sm font-semibold text-gray-800 truncate">
                                                    {detalle.productName || detalle.product?.name || `Producto #${detalle.product?.id}`}
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-xs text-gray-400">Cantidad</p>
                                                <p className="text-sm font-black text-cixoil-red">{detalle.quantity}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="px-6 py-4 border-t border-gray-100 space-y-2">
                        {puedeRecibir && (
                            <>
                                {esPendiente && (
                                    <button
                                        onClick={() => {
                                            setErrorParcial(null);
                                            setMostrarParcial(true);
                                        }}
                                        disabled={cargando}
                                        className="w-full border border-blue-300 text-blue-700 rounded-lg py-2.5 text-sm font-medium hover:bg-blue-50 transition-colors disabled:opacity-50"
                                    >
                                        Marcar como recibido parcialmente
                                    </button>
                                )}
                                {esParcial && (
                                    <button
                                        onClick={() => {
                                            setErrorParcial(null);
                                            setMostrarParcial(true);
                                        }}
                                        disabled={cargando}
                                        className="w-full border border-blue-300 text-blue-700 rounded-lg py-2.5 text-sm font-medium hover:bg-blue-50 transition-colors disabled:opacity-50"
                                    >
                                        Registrar otra recepcion parcial
                                    </button>
                                )}
                                <button
                                    onClick={handleRecibir}
                                    disabled={cargando}
                                    className="w-full bg-cixoil-green text-white rounded-lg py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {cargando ? "Procesando..." : "Marcar como recibido"}
                                </button>
                            </>
                        )}
                        <button
                            onClick={onClose}
                            className="w-full border border-gray-300 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>

            {mostrarParcial && (
                <ModalRecepcionParcial
                    orden={orden}
                    onConfirmar={handleConfirmarParcial}
                    onCancelar={() => setMostrarParcial(false)}
                    cargando={cargando}
                    error={errorParcial}
                />
            )}
        </>
    );
}
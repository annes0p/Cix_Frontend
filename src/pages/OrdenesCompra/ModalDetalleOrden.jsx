import { Calendar, DollarSign, Package, Truck, X } from "lucide-react";
import { useState } from "react";
import {
    recibirOrden,
    recibirOrdenParcial,
} from "../../services/ordenesService";

function EstadoBadge({ estado }) {
    const estilos = {
        PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
        PARTIALLY_RECEIVED: "bg-blue-100 text-blue-700 border-blue-200",
        RECEIVED: "bg-green-100 text-green-700 border-green-200",
    };
    const etiquetas = {
        PENDING: "Pendiente",
        PARTIALLY_RECEIVED: "Recibido parcialmente",
        RECEIVED: "Recibido",
    };

    return (
        <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${estilos[estado] || "bg-gray-100 text-gray-700 border-gray-200"}`}
        >
            {etiquetas[estado] || estado || "Sin estado"}
        </span>
    );
}

export default function ModalDetalleOrden({ orden, onClose, onActualizar }) {
    const [cargando, setCargando] = useState(false);

    if (!orden) return null;

    const esPendiente = orden.receptionStatus === "PENDING";
    const esParcial = orden.receptionStatus === "PARTIALLY_RECEIVED";
    const puedeRecibir = esPendiente || esParcial;

    const handleRecibir = async () => {
        try {
            setCargando(true);
            await recibirOrden(orden.id);
            onActualizar?.();
            onClose();
        } catch (err) {
            console.error("Error al marcar como recibido:", err);
        } finally {
            setCargando(false);
        }
    };

    const handleRecibirParcial = async () => {
        try {
            setCargando(true);
            await recibirOrdenParcial(orden.id);
            onActualizar?.();
            onClose();
        } catch (err) {
            console.error("Error al marcar como recibido parcialmente:", err);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center px-6 py-4 border-b">
                    <div>
                        <h2 className="font-bold text-lg">
                            OC-{orden.id.toString().padStart(4, "0")}
                        </h2>
                        <p className="text-sm text-gray-500">
                            Detalle de orden de compra
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                            <Truck
                                size={18}
                                className="text-cixoil-red shrink-0"
                            />
                            <div>
                                <p className="text-xs text-gray-400 font-medium">
                                    Proveedor
                                </p>
                                <p className="text-sm font-bold text-gray-800">
                                    {orden.supplier?.legalName || "-"}
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                            <DollarSign
                                size={18}
                                className="text-cixoil-green shrink-0"
                            />
                            <div>
                                <p className="text-xs text-gray-400 font-medium">
                                    Total
                                </p>
                                <p className="text-sm font-black text-cixoil-red">
                                    S/. {orden.total || "0.00"}
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                            <Calendar
                                size={18}
                                className="text-gray-400 shrink-0"
                            />
                            <div>
                                <p className="text-xs text-gray-400 font-medium">
                                    Fecha de compra
                                </p>
                                <p className="text-sm font-bold text-gray-800">
                                    {orden.purchasedAt || "-"}
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                            <Calendar
                                size={18}
                                className="text-gray-400 shrink-0"
                            />
                            <div>
                                <p className="text-xs text-gray-400 font-medium">
                                    Entrega estimada
                                </p>
                                <p className="text-sm font-bold text-gray-800">
                                    {orden.estimatedDeliveryAt ||
                                        "No especificada"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-500 font-medium">
                            Estado:
                        </p>
                        <EstadoBadge estado={orden.receptionStatus} />
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Package size={16} className="text-cixoil-red" />
                            <p className="text-sm font-bold text-gray-800">
                                Productos
                            </p>
                        </div>

                        {!orden.details || orden.details.length === 0 ? (
                            <div className="bg-gray-50 rounded-xl p-4 text-center">
                                <p className="text-xs text-gray-400">
                                    Sin detalle de productos
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {orden.details.map((detalle, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
                                    >
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">
                                                {detalle.productName ||
                                                    detalle.product?.name ||
                                                    `Producto #${detalle.idProduct}`}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400">
                                                Cantidad
                                            </p>
                                            <p className="text-sm font-black text-cixoil-red">
                                                {detalle.quantity}
                                            </p>
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
                                    onClick={handleRecibirParcial}
                                    disabled={cargando}
                                    className="w-full border border-blue-300 text-blue-700 rounded-lg py-2.5 text-sm font-medium hover:bg-blue-50 transition-colors disabled:opacity-50"
                                >
                                    {cargando
                                        ? "Procesando..."
                                        : "Marcar como recibido parcialmente"}
                                </button>
                            )}
                            <button
                                onClick={handleRecibir}
                                disabled={cargando}
                                className="w-full bg-cixoil-green text-white rounded-lg py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {cargando
                                    ? "Procesando..."
                                    : "Marcar como recibido"}
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
    );
}

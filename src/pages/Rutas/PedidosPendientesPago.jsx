import { Banknote, Loader2, PackageCheck } from "lucide-react";
import { useState } from "react";
import { confirmarPagoVenta } from "../../services/crmService";

const METODOS_PAGO = [
    { value: "CASH", label: "Efectivo" },
    { value: "CARD", label: "Tarjeta" },
    { value: "YAPE", label: "Yape" },
    { value: "TRANSFER", label: "Transferencia" },
];

const nombreCliente = (client) => {
    if (!client) return "Cliente";
    return [client.name, client.fatherLastName, client.motherLastName]
        .filter(Boolean)
        .join(" ");
};

export default function PedidosPendientesPago({ ventas, onActualizar }) {
    const [confirmandoId, setConfirmandoId] = useState(null);
    const [metodoPago, setMetodoPago] = useState("CASH");
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState(null);
    const [ultimaConfirmada, setUltimaConfirmada] = useState(null);

    const pendientes = (ventas || []).filter(
        (v) => v.transactionStatus === "PENDING",
    );

    if (pendientes.length === 0) return null;

    const abrirConfirmacion = (idSale) => {
        setConfirmandoId(idSale);
        setMetodoPago("CASH");
        setError(null);
        setUltimaConfirmada(null);
    };

    const confirmarPago = async (idSale) => {
        try {
            setGuardando(true);
            setError(null);
            await confirmarPagoVenta(idSale, metodoPago);
            setConfirmandoId(null);
            setUltimaConfirmada(idSale);
            onActualizar?.();
        } catch (err) {
            console.error("Error al confirmar pago:", err);
            setError(
                err?.response?.data?.message ||
                    "No se pudo confirmar el pago. Intenta de nuevo.",
            );
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-yellow-200 mb-6 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-4 flex items-center gap-3 bg-yellow-50 border-b border-yellow-200">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center shrink-0">
                    <Banknote size={20} className="text-yellow-700" />
                </div>
                <div>
                    <h2 className="font-bold text-yellow-800 text-sm sm:text-base">
                        Pedidos del portal esperando confirmación de pago (
                        {pendientes.length})
                    </h2>
                    <p className="text-xs text-yellow-700/80">
                        Confirma el pago recibido y luego crea el envío desde
                        "Nueva ruta" seleccionando esta venta.
                    </p>
                </div>
            </div>

            <div className="divide-y divide-gray-100">
                {pendientes.map((venta) => (
                    <div key={venta.id} className="px-4 sm:px-6 py-3">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-800">
                                    VEN-
                                    {venta.id.toString().padStart(4, "0")} ·{" "}
                                    {nombreCliente(venta.client)}
                                </p>
                                <p className="text-xs text-gray-400">
                                    S/. {venta.total} ·{" "}
                                    {venta.client?.docNumber || "sin doc"}
                                </p>
                            </div>

                            {ultimaConfirmada === venta.id ? (
                                <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                                    <PackageCheck size={14} />
                                    Pago confirmado
                                </span>
                            ) : confirmandoId !== venta.id ? (
                                <button
                                    onClick={() =>
                                        abrirConfirmacion(venta.id)
                                    }
                                    className="text-xs font-semibold text-cixoil-red hover:opacity-75 shrink-0"
                                >
                                    Confirmar pago
                                </button>
                            ) : null}
                        </div>

                        {confirmandoId === venta.id && (
                            <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-2.5 flex flex-col sm:flex-row sm:items-center gap-2">
                                <select
                                    value={metodoPago}
                                    onChange={(e) =>
                                        setMetodoPago(e.target.value)
                                    }
                                    disabled={guardando}
                                    className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-cixoil-red"
                                >
                                    {METODOS_PAGO.map((m) => (
                                        <option key={m.value} value={m.value}>
                                            {m.label}
                                        </option>
                                    ))}
                                </select>
                                <div className="flex gap-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            confirmarPago(venta.id)
                                        }
                                        disabled={guardando}
                                        className="flex items-center gap-1.5 bg-cixoil-red text-white text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-50"
                                    >
                                        {guardando && (
                                            <Loader2
                                                size={12}
                                                className="animate-spin"
                                            />
                                        )}
                                        Confirmar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setConfirmandoId(null)}
                                        disabled={guardando}
                                        className="text-xs font-medium text-gray-500 hover:text-gray-700"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        )}

                        {error && confirmandoId === venta.id && (
                            <p className="text-xs text-red-500 mt-1.5">
                                {error}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

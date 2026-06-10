import { Calendar, DollarSign, ShoppingBag, User } from "lucide-react";

export default function CRMDetalle({ cliente }) {
    if (!cliente) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 h-full flex flex-col items-center justify-center gap-2 text-center">
                <User size={32} className="text-gray-300" />
                <p className="text-sm font-semibold text-gray-400">
                    Selecciona un cliente
                </p>
                <p className="text-xs text-gray-300">
                    para ver su historial de compras
                </p>
            </div>
        );
    }

    const ultimaCompra = cliente.ultimaCompra
        ? new Date(cliente.ultimaCompra).toLocaleDateString("es-PE", {
              dateStyle: "medium",
          })
        : "Sin compras";

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 rounded-full bg-cixoil-red/10 flex items-center justify-center text-lg font-black text-cixoil-red shrink-0">
                    {cliente.name?.charAt(0)}
                    {cliente.fatherLastName?.charAt(0)}
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">
                        {cliente.name} {cliente.fatherLastName}{" "}
                        {cliente.motherLastName}
                    </h3>
                    <p className="text-xs text-gray-400">{cliente.email}</p>
                    <p className="text-xs text-gray-400">
                        {cliente.phoneNumber}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                        <ShoppingBag size={14} className="text-cixoil-red" />
                        <p className="text-xs font-semibold text-gray-500">
                            Compras
                        </p>
                    </div>
                    <p className="text-xl font-black text-gray-900">
                        {cliente.frecuencia}
                    </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                        <DollarSign size={14} className="text-cixoil-green" />
                        <p className="text-xs font-semibold text-gray-500">
                            Total gastado
                        </p>
                    </div>
                    <p className="text-xl font-black text-cixoil-green">
                        S/. {cliente.totalGastado.toFixed(2)}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                <Calendar size={14} className="text-gray-400" />
                <div>
                    <p className="text-xs font-semibold text-gray-500">
                        Ultima compra
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                        {ultimaCompra}
                    </p>
                </div>
            </div>

            <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Historial de compras
                </p>
                {cliente.ventasCliente.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">
                        Sin compras registradas
                    </p>
                ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {cliente.ventasCliente
                            .sort(
                                (a, b) =>
                                    new Date(b.saleDate) - new Date(a.saleDate),
                            )
                            .map((venta) => (
                                <div
                                    key={venta.id}
                                    className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
                                >
                                    <div>
                                        <p className="text-xs font-semibold text-gray-700">
                                            VEN-
                                            {venta.id
                                                .toString()
                                                .padStart(4, "0")}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(
                                                venta.saleDate,
                                            ).toLocaleDateString("es-PE")}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-cixoil-red">
                                            S/. {venta.total.toFixed(2)}
                                        </p>
                                        <p
                                            className={`text-xs font-semibold ${
                                                venta.transactionStatus ===
                                                "COMPLETED"
                                                    ? "text-cixoil-green"
                                                    : "text-gray-400"
                                            }`}
                                        >
                                            {venta.transactionStatus ===
                                            "COMPLETED"
                                                ? "Completada"
                                                : venta.transactionStatus}
                                        </p>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
}

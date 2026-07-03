import {
    DollarSign,
    ShoppingBag,
    TrendingDown,
    TrendingUp,
} from "lucide-react";

const formatSoles = (valor) =>
    `S/. ${(valor || 0).toLocaleString("es-PE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

export default function Rentabilidad({ ventas }) {
    const ventasCompletadas = ventas.filter(
        (v) => v.transactionStatus === "COMPLETED",
    );
    const ventasCanceladas = ventas.filter(
        (v) => v.transactionStatus === "CANCELED",
    );

    const totalFacturado = ventasCompletadas.reduce(
        (acc, v) => acc + (v.total || 0),
        0,
    );
    const totalSubtotal = ventasCompletadas.reduce(
        (acc, v) => acc + (v.subtotal || 0),
        0,
    );
    const totalIGV = ventasCompletadas.reduce(
        (acc, v) => acc + (v.taxAmount || 0),
        0,
    );
    const totalCancelado = ventasCanceladas.reduce(
        (acc, v) => acc + (v.total || 0),
        0,
    );
    const ticketPromedio =
        ventasCompletadas.length > 0
            ? totalFacturado / ventasCompletadas.length
            : 0;

    const porMetodoPago = ventasCompletadas.reduce((acc, v) => {
        const metodo = v.paymentMethod || "OTRO";
        const etiquetas = {
            CASH: "Efectivo",
            CARD: "Tarjeta",
            YAPE: "Yape",
            TRANSFER: "Transferencia",
        };
        const label = etiquetas[metodo] || metodo;
        if (!acc[label]) acc[label] = 0;
        acc[label] += v.total || 0;
        return acc;
    }, {});

    const metricas = [
        {
            label: "Total facturado",
            value: formatSoles(totalFacturado),
            sub: `${ventasCompletadas.length} ventas completadas`,
            icon: <DollarSign size={20} className="text-white" />,
            bg: "bg-cixoil-green",
            positivo: true,
        },
        {
            label: "Subtotal neto",
            value: formatSoles(totalSubtotal),
            sub: "Sin IGV",
            icon: <TrendingUp size={20} className="text-white" />,
            bg: "bg-teal-600",
            positivo: true,
        },
        {
            label: "IGV recaudado",
            value: formatSoles(totalIGV),
            sub: "Tasa de IGV: 18%",
            icon: <ShoppingBag size={20} className="text-white" />,
            bg: "bg-blue-600",
            positivo: true,
        },
        {
            label: "Ticket promedio",
            value: formatSoles(ticketPromedio),
            sub: "Por venta completada",
            icon: <TrendingUp size={20} className="text-white" />,
            bg: "bg-purple-600",
            positivo: true,
        },
        {
            label: "Ventas canceladas",
            value: formatSoles(totalCancelado),
            sub: `${ventasCanceladas.length} ventas canceladas`,
            icon: <TrendingDown size={20} className="text-white" />,
            bg: "bg-red-600",
            positivo: false,
        },
    ];

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h3 className="text-sm font-bold text-cixoil-red">
                        Analisis de rentabilidad
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Resumen financiero de ventas
                    </p>
                </div>
                <span className="text-xs font-semibold bg-cixoil-green/10 text-cixoil-green px-3 py-1 rounded-full">
                    {ventas.length} ventas totales
                </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                {metricas.map((m, i) => (
                    <div
                        key={i}
                        className="bg-gray-50 rounded-xl p-3 flex flex-col gap-2"
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500 font-medium">
                                {m.label}
                            </p>
                            <div
                                className={`w-7 h-7 rounded-lg ${m.bg} flex items-center justify-center shrink-0`}
                            >
                                {m.icon}
                            </div>
                        </div>
                        <p
                            className={`text-lg font-black ${m.positivo ? "text-gray-900" : "text-red-600"}`}
                        >
                            {m.value}
                        </p>
                        <p className="text-xs text-gray-400">{m.sub}</p>
                    </div>
                ))}
            </div>

            <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Ventas por metodo de pago
                </p>
                <div className="space-y-2">
                    {Object.entries(porMetodoPago).map(([metodo, total]) => {
                        const porcentaje =
                            totalFacturado > 0
                                ? (total / totalFacturado) * 100
                                : 0;
                        return (
                            <div key={metodo}>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="font-semibold text-gray-700">
                                        {metodo}
                                    </span>
                                    <span className="text-gray-500">
                                        {formatSoles(total)} (
                                        {porcentaje.toFixed(1)}%)
                                    </span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div
                                        className="bg-cixoil-red h-2 rounded-full transition-all"
                                        style={{ width: `${porcentaje}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

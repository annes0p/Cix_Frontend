import {
    ArrowLeftRight,
    Box,
    ShoppingBag,
    TriangleAlert,
    Users,
} from "lucide-react";

export default function MatricsGrid({
    totalProductos,
    totalClientes,
    totalVentas,
    totalMovimientos,
    stockCritico,
}) {
    const metrics = [
        {
            title: "Productos en inventario",
            value: totalProductos,
            sub: "Total de productos registrados",
            icon: <Box className="text-white" size={20} />,
            bg: "bg-emerald-700",
        },
        {
            title: "Clientes registrados",
            value: totalClientes,
            sub: "Total de clientes activos",
            icon: <Users className="text-white" size={20} />,
            bg: "bg-red-900",
        },
        {
            title: "Ventas realizadas",
            value: totalVentas,
            sub: "Total de ventas en el sistema",
            icon: <ShoppingBag className="text-white" size={20} />,
            bg: "bg-teal-700",
        },
        {
            title: "Movimientos",
            value: totalMovimientos,
            sub: "Entradas y salidas registradas",
            icon: <ArrowLeftRight className="text-white" size={20} />,
            bg: "bg-red-950",
        },
        {
            title: "Alertas de stock",
            value: stockCritico,
            sub: "Productos con stock critico",
            icon: <TriangleAlert className="text-white" size={20} />,
            bg: stockCritico > 0 ? "bg-red-600" : "bg-green-700",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {metrics.map((m, idx) => (
                <div
                    key={idx}
                    className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between transition-all hover:shadow-md"
                >
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-gray-500">
                                {m.title}
                            </span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-extrabold text-gray-900 tracking-tight">
                                    {m.value}
                                </span>
                            </div>
                        </div>
                        <div
                            className={`p-2.5 rounded-full ${m.bg} shadow-sm shrink-0`}
                        >
                            {m.icon}
                        </div>
                    </div>
                    <div className="mt-4 pt-2 border-t border-gray-50 text-[11px] text-gray-400 font-medium">
                        {m.sub}
                    </div>
                </div>
            ))}
        </div>
    );
}

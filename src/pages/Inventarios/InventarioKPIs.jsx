import {
    AlertTriangle,
    ArrowLeftRight,
    DollarSign,
    Package,
    XCircle,
} from "lucide-react";

export default function InventarioKPIs({ productos }) {
    const total = productos.length;
    const valorTotal = productos.reduce(
        (acc, p) => acc + p.precio * p.stockActual,
        0,
    );
    const stockBajo = productos.filter(
        (p) => p.stockActual > 0 && p.stockActual < p.stockMinimo,
    ).length;
    const sinStock = productos.filter((p) => p.stockActual === 0).length;

    const kpis = [
        {
            label: "Total productos",
            value: total,
            sub: "Activos en inventario",
            icon: <Package size={28} className="text-cixoil-green" />,
            bg: "bg-green-50",
        },
        {
            label: "Valor total inventario",
            value: `S/. ${valorTotal.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`,
            sub: "Valor de costo",
            icon: <DollarSign size={28} className="text-cixoil-green" />,
            bg: "bg-green-50",
        },
        {
            label: "Stock bajo",
            value: stockBajo,
            sub: "Requieren atención",
            icon: <AlertTriangle size={28} className="text-yellow-500" />,
            bg: "bg-yellow-50",
        },
        {
            label: "Sin stock",
            value: sinStock,
            sub: "Agotados",
            icon: <XCircle size={28} className="text-red-500" />,
            bg: "bg-red-50",
        },
        {
            label: "Movimientos hoy",
            value: 0,
            sub: "Entradas y salidas",
            icon: <ArrowLeftRight size={28} className="text-blue-500" />,
            bg: "bg-blue-50",
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {kpis.map((kpi, i) => (
                <div
                    key={i}
                    className="bg-white rounded-xl border border-gray-200 p-4 flex justify-between items-start shadow-sm"
                >
                    <div>
                        <p className="text-xs text-gray-500 mb-1">
                            {kpi.label}
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                            {kpi.value}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
                    </div>
                    <div className={`${kpi.bg} p-2 rounded-lg`}>{kpi.icon}</div>
                </div>
            ))}
        </div>
    );
}

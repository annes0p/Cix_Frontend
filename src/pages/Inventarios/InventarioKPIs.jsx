import {
    AlertTriangle,
    ArrowLeftRight,
    DollarSign,
    Package,
    Wallet,
    XCircle,
} from "lucide-react";

export default function InventarioKPIs({
    productos,
    movimientosHoy = 0,
    costoPorProducto = {},
}) {
    const total = productos.length;
    const valorTotal = productos.reduce(
        (acc, p) => acc + (p.precio || 0) * (p.stockActual || 0),
        0,
    );
    const valorCosto = productos.reduce((acc, p) => {
        const costoUnitario = costoPorProducto[p.idProducto];
        if (costoUnitario == null) return acc;
        return acc + costoUnitario * (p.stockActual || 0);
    }, 0);
    const productosSinCosto = productos.filter(
        (p) => costoPorProducto[p.idProducto] == null,
    ).length;
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
            value: `S/. ${valorTotal.toLocaleString("es-PE", { maximumFractionDigits: 0 })}`,
            sub: "A precio de venta",
            icon: <DollarSign size={18} className="text-cixoil-green" />,
            bg: "bg-green-50",
        },
        {
            label: "Valor de costo",
            value: `S/. ${valorCosto.toLocaleString("es-PE", { maximumFractionDigits: 0 })}`,
            sub:
                productosSinCosto > 0
                    ? `${productosSinCosto} sin compras recibidas`
                    : "Ultimo precio de compra",
            icon: <Wallet size={18} className="text-teal-600" />,
            bg: "bg-teal-50",
        },
        {
            label: "Stock bajo",
            value: stockBajo,
            sub: "Requieren atencion",
            icon: <AlertTriangle size={18} className="text-yellow-500" />,
            bg: "bg-yellow-50",
        },
        {
            label: "Sin stock",
            value: sinStock,
            sub: "Agotados",
            icon: <XCircle size={18} className="text-red-500" />,
            bg: "bg-red-50",
        },
        {
            label: "Movimientos hoy",
            value: movimientosHoy,
            sub: "Entradas y salidas",
            icon: <ArrowLeftRight size={18} className="text-blue-500" />,
            bg: "bg-blue-50",
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {kpis.map((kpi, i) => (
                <div
                    key={i}
                    className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col gap-2"
                >
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-gray-500">{kpi.label}</p>
                        <div
                            className={`${kpi.bg} w-7 h-7 rounded-lg flex items-center justify-center shrink-0`}
                        >
                            {kpi.icon}
                        </div>
                    </div>
                    <p className="text-xl font-bold text-gray-900 whitespace-nowrap">
                        {kpi.value}
                    </p>
                    <p className="text-xs text-gray-400">{kpi.sub}</p>
                </div>
            ))}
        </div>
    );
}

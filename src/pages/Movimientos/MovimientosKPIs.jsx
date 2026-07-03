import {
    DollarSign,
    FileText,
    ShoppingCart,
    TrendingUp,
    Users,
} from "lucide-react";

function KpiCard({ icon: Icon, iconBg, label, valor, delta }) {
    const esPositivo = delta >= 0;
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 shadow-sm">
            <div
                className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}
            >
                <Icon size={22} className="text-white" />
            </div>
            <div className="min-w-0">
                <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                <p className="text-xl font-bold text-gray-900 leading-tight">
                    {valor}
                </p>
                <div
                    className={`flex items-center gap-1 text-xs font-medium mt-0.5 ${esPositivo ? "text-green-600" : "text-red-600"}`}
                >
                    <TrendingUp
                        size={12}
                        className={!esPositivo ? "rotate-180" : ""}
                    />
                    <span>
                        {esPositivo ? "+" : ""}
                        {delta}% vs. mes anterior
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function MovimientosKPIs({ kpis }) {
    const fmt = (val) => "S/. " + val.toLocaleString("es-PE");

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
                icon={ShoppingCart}
                iconBg="bg-cixoil-green"
                label="Ventas del mes"
                valor={fmt(kpis.ventasMes)}
                delta={kpis.ventasMesDelta}
            />
            <KpiCard
                icon={FileText}
                iconBg="bg-red-400"
                label="Pedidos del mes"
                valor={kpis.pedidosMes}
                delta={kpis.pedidosMesDelta}
            />
            <KpiCard
                icon={DollarSign}
                iconBg="bg-cixoil-green"
                label="Ticket promedio"
                valor={fmt(kpis.ticketPromedio)}
                delta={kpis.ticketPromedioDelta}
            />
            <KpiCard
                icon={Users}
                iconBg="bg-blue-500"
                label="Clientes atendidos"
                valor={kpis.clientesAtendidos}
                delta={kpis.clientesAtendidosDelta}
            />
        </div>
    );
}

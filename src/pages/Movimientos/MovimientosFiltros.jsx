import { Search } from "lucide-react";

const TABS = ["Todos", "Pedidos", "Ventas", "Completados", "Cancelados"];

export default function MovimientosFiltros({ filtros, onFiltroChange }) {
    const tabActivo =
        filtros.tipo === "Todos" && filtros.estado === "Todos"
            ? "Todos"
            : filtros.tipo === "Pedido"
            ? "Pedidos"
            : filtros.tipo === "Venta"
            ? "Ventas"
            : filtros.estado === "Completado"
            ? "Completados"
            : filtros.estado === "Cancelado"
            ? "Cancelados"
            : "Todos";

    const handleTab = (tab) => {
        switch (tab) {
            case "Todos":
                onFiltroChange("tipo", "Todos");
                onFiltroChange("estado", "Todos");
                break;
            case "Pedidos":
                onFiltroChange("tipo", "Pedido");
                onFiltroChange("estado", "Todos");
                break;
            case "Ventas":
                onFiltroChange("tipo", "Venta");
                onFiltroChange("estado", "Todos");
                break;
            case "Completados":
                onFiltroChange("tipo", "Todos");
                onFiltroChange("estado", "Completado");
                break;
            case "Cancelados":
                onFiltroChange("tipo", "Todos");
                onFiltroChange("estado", "Cancelado");
                break;
        }
    };

    return (
        <div className="border-b border-gray-200">
            {/* Fila de filtros */}
            <div className="px-5 py-3 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-48">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={filtros.busqueda}
                        onChange={(e) => onFiltroChange("busqueda", e.target.value)}
                        placeholder="Buscar pedido, cliente o número de documento..."
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-cixoil-red transition-colors placeholder:text-gray-400"
                    />
                </div>

                <select
                    value={filtros.tipo}
                    onChange={(e) => onFiltroChange("tipo", e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-cixoil-red transition-colors"
                >
                    <option value="Todos">Tipo: Todos</option>
                    <option value="Venta">Venta</option>
                    <option value="Pedido">Pedido</option>
                </select>

                <select
                    value={filtros.estado}
                    onChange={(e) => onFiltroChange("estado", e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-cixoil-red transition-colors"
                >
                    <option value="Todos">Estado: Todos</option>
                    <option value="Completado">Completado</option>
                    <option value="En proceso">En proceso</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Cancelado">Cancelado</option>
                </select>

                <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700">
                    <span className="text-xs text-gray-500">Fecha</span>
                    <input
                        type="date"
                        value={filtros.fechaDesde}
                        onChange={(e) => onFiltroChange("fechaDesde", e.target.value)}
                        className="text-xs text-gray-700 focus:outline-none"
                    />
                    <span className="text-gray-400 text-xs">-</span>
                    <input
                        type="date"
                        value={filtros.fechaHasta}
                        onChange={(e) => onFiltroChange("fechaHasta", e.target.value)}
                        className="text-xs text-gray-700 focus:outline-none"
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="px-5 flex gap-6">
                {TABS.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => handleTab(tab)}
                        className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                            tabActivo === tab
                                ? "border-cixoil-red text-cixoil-red"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>
    );
}
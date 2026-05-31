import { Filter, Search } from "lucide-react";

export default function InventarioFiltros({ filtros, onFiltroChange }) {
    return (
        <div className="flex flex-col lg:flex-row gap-3 mb-6">
            {/* Buscador */}
            <div className="relative flex-1">
                <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                />
                <input
                    type="text"
                    placeholder="Buscar producto, código o descripción..."
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cixoil-red focus:border-transparent transition-all placeholder:text-gray-400"
                    value={filtros.busqueda}
                    onChange={(e) => onFiltroChange("busqueda", e.target.value)}
                />
            </div>

            {/* Filtro Categoría */}
            <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400 px-1">Categoría</span>
                <select
                    className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cixoil-red transition-all text-gray-700 bg-white"
                    value={filtros.categoria}
                    onChange={(e) =>
                        onFiltroChange("categoria", e.target.value)
                    }
                >
                    <option value="">Todas</option>
                    <option value="Lubricantes">Lubricantes</option>
                    <option value="Filtros">Filtros</option>
                    <option value="Grasas">Grasas</option>
                    <option value="Químicos">Químicos</option>
                </select>
            </div>

            {/* Filtro Almacén */}
            <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400 px-1">Almacén</span>
                <select
                    className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cixoil-red transition-all text-gray-700 bg-white"
                    value={filtros.almacen}
                    onChange={(e) => onFiltroChange("almacen", e.target.value)}
                >
                    <option value="">Todos</option>
                    <option value="Bodega Principal">Bodega Principal</option>
                    <option value="Bodega Secundaria">Bodega Secundaria</option>
                </select>
            </div>

            {/* Filtro Estado */}
            <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400 px-1">Estado</span>
                <select
                    className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cixoil-red transition-all text-gray-700 bg-white"
                    value={filtros.estado}
                    onChange={(e) => onFiltroChange("estado", e.target.value)}
                >
                    <option value="">Todos</option>
                    <option value="optimo">Óptimo</option>
                    <option value="bajo">Stock bajo</option>
                    <option value="agotado">Sin stock</option>
                </select>
            </div>

            {/* Botón Filtros */}
            <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400 px-1 invisible">.</span>
                <button className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <Filter size={16} />
                    Filtros
                </button>
            </div>
        </div>
    );
}

import { Eye, MoreVertical } from "lucide-react";

function EstadoBadge({ stockActual, stockMinimo }) {
    if (stockActual === 0) {
        return (
            <span className="px-2 py-1 rounded-md text-xs font-semibold bg-red-100 text-red-700">
                Sin stock
            </span>
        );
    }
    if (stockActual < stockMinimo) {
        return (
            <span className="px-2 py-1 rounded-md text-xs font-semibold bg-orange-100 text-orange-700">
                Stock bajo
            </span>
        );
    }
    return (
        <span className="px-2 py-1 rounded-md text-xs font-semibold bg-green-100 text-green-700">
            Óptimo
        </span>
    );
}

function StockValor({ stockActual, stockMinimo }) {
    if (stockActual === 0)
        return <span className="font-bold text-red-600">{stockActual}</span>;
    if (stockActual < stockMinimo)
        return <span className="font-bold text-orange-500">{stockActual}</span>;
    return <span className="font-bold text-green-600">{stockActual}</span>;
}

export default function InventarioTabla({
    productos,
    pagina,
    totalPaginas,
    onPaginaChange,
    onVerProducto,
}) {
    if (productos.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <p className="text-gray-400 text-sm">
                    No se encontraron productos con los filtros aplicados.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Código
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Producto
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Categoría
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Almacén
                        </th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Stock actual
                        </th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Stock mínimo
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Estado
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Última actualización
                        </th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {productos.map((producto, i) => (
                        <tr
                            key={producto.id || i}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                            <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                                {producto.codigo}
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {producto.imagen ? (
                                            <img
                                                src={producto.imagen}
                                                alt={producto.nombre}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-5 h-5 bg-gray-300 rounded" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {producto.name || producto.nombre}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {producto.presentacion}
                                        </p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                                {producto.category?.name || producto.categoria}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                                {producto.almacen}
                            </td>
                            <td className="px-4 py-3 text-center">
                                <StockValor
                                    stockActual={producto.stockActual ?? 0}
                                    stockMinimo={producto.stockMinimo ?? 0}
                                />
                            </td>
                            <td className="px-4 py-3 text-center text-gray-600">
                                {producto.stockMinimo ?? 0}
                            </td>
                            <td className="px-4 py-3">
                                <EstadoBadge
                                    stockActual={producto.stockActual ?? 0}
                                    stockMinimo={producto.stockMinimo ?? 0}
                                />
                            </td>
                            <td className="px-4 py-3">
                                <p className="text-gray-600 text-xs">
                                    {producto.ultimaActualizacion}
                                </p>
                                <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                                    Automático
                                </p>
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => onVerProducto(producto)}
                                        className="text-gray-400 hover:text-cixoil-red transition-colors p-1 rounded hover:bg-gray-100"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button className="text-gray-400 hover:text-cixoil-red transition-colors p-1 rounded hover:bg-gray-100">
                                        <MoreVertical size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Paginación */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                    Mostrando {productos.length} productos
                </p>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onPaginaChange(pagina - 1)}
                        disabled={pagina === 1}
                        className="p-1.5 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        ‹
                    </button>
                    {Array.from(
                        { length: Math.min(totalPaginas, 5) },
                        (_, i) => i + 1,
                    ).map((n) => (
                        <button
                            key={n}
                            onClick={() => onPaginaChange(n)}
                            className={`w-8 h-8 rounded border text-xs font-medium transition-colors ${
                                pagina === n
                                    ? "bg-cixoil-green text-white border-cixoil-green"
                                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            {n}
                        </button>
                    ))}
                    <button
                        onClick={() => onPaginaChange(pagina + 1)}
                        disabled={pagina === totalPaginas}
                        className="p-1.5 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        ›
                    </button>
                </div>
            </div>
        </div>
    );
}

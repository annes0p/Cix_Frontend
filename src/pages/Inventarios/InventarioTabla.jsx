import { Eye, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
            Optimo
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

function MenuAcciones({ producto, onEditar, onEliminar }) {
    const [abierto, setAbierto] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        function handleClickFuera(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setAbierto(false);
            }
        }
        if (abierto) document.addEventListener("mousedown", handleClickFuera);
        return () => document.removeEventListener("mousedown", handleClickFuera);
    }, [abierto]);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setAbierto((prev) => !prev)}
                className="text-gray-400 hover:text-cixoil-red transition-colors p-1 rounded hover:bg-gray-100"
            >
                <MoreVertical size={16} />
            </button>
            {abierto && (
                <div className="absolute right-0 top-8 z-30 w-36 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    <button
                        onClick={() => { setAbierto(false); onEditar(producto); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <Pencil size={14} className="text-gray-400" />
                        Editar
                    </button>
                    <button
                        onClick={() => { setAbierto(false); onEliminar(producto); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <Trash2 size={14} />
                        Eliminar
                    </button>
                </div>
            )}
        </div>
    );
}

export default function InventarioTabla({
    productos,
    pagina,
    totalPaginas,
    onPaginaChange,
    onVerProducto,
    onEditarProducto,
    onEliminarProducto,
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

    const Paginacion = () => (
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
                    &lsaquo;
                </button>
                {Array.from({ length: Math.min(totalPaginas, 5) }, (_, i) => i + 1).map((n) => (
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
                    &rsaquo;
                </button>
            </div>
        </div>
    );

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Vista móvil - cards */}
            <div className="block sm:hidden">
                {productos.map((producto, i) => (
                    <div key={producto.id || i} className="border-b border-gray-100 p-4">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                    <div className="w-5 h-5 bg-gray-300 rounded" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">
                                        {producto.name || producto.nombre}
                                    </p>
                                    <p className="text-xs text-gray-400">{producto.codigo}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <button
                                    onClick={() => onVerProducto(producto)}
                                    className="text-gray-400 hover:text-cixoil-red p-1 rounded"
                                >
                                    <Eye size={16} />
                                </button>
                                <MenuAcciones
                                    producto={producto}
                                    onEditar={onEditarProducto}
                                    onEliminar={onEliminarProducto}
                                />
                            </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-4 text-xs">
                            <div className="min-w-[80px]">
                                <p className="text-gray-400 mb-1">Categoria</p>
                                <p className="font-medium text-gray-700">
                                    {producto.category?.name || producto.categoria}
                                </p>
                            </div>
                            <div className="min-w-[60px]">
                                <p className="text-gray-400 mb-1">Stock</p>
                                <StockValor
                                    stockActual={producto.stockActual ?? 0}
                                    stockMinimo={producto.stockMinimo ?? 0}
                                />
                            </div>
                            <div className="min-w-[80px]">
                                <p className="text-gray-400 mb-1">Estado</p>
                                <EstadoBadge
                                    stockActual={producto.stockActual ?? 0}
                                    stockMinimo={producto.stockMinimo ?? 0}
                                />
                            </div>
                        </div>
                    </div>
                ))}
                <Paginacion />
            </div>

            {/* Vista desktop - tabla */}
            <div className="hidden sm:block">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Codigo</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Producto</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Categoria</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Almacen</th>
                            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock actual</th>
                            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock minimo</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ultima actualizacion</th>
                            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productos.map((producto, i) => (
                            <tr
                                key={producto.id || i}
                                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{producto.codigo}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                            <div className="w-5 h-5 bg-gray-300 rounded" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {producto.name || producto.nombre}
                                            </p>
                                            <p className="text-xs text-gray-400">{producto.presentacion}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                    {producto.category?.name || producto.categoria}
                                </td>
                                <td className="px-4 py-3 text-gray-600">{producto.almacen}</td>
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
                                    <p className="text-gray-600 text-xs">{producto.ultimaActualizacion}</p>
                                    <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                                        Automatico
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
                                        <MenuAcciones
                                            producto={producto}
                                            onEditar={onEditarProducto}
                                            onEliminar={onEliminarProducto}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <Paginacion />
            </div>
        </div>
    );
}
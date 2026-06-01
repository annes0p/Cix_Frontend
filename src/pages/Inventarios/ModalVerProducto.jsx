import { Package, X } from "lucide-react";

function EstadoBadge({ stockActual, stockMinimo }) {
    if (stockActual === 0)
        return (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                Sin stock
            </span>
        );
    if (stockActual < stockMinimo)
        return (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                Stock bajo
            </span>
        );
    return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            Óptimo
        </span>
    );
}

export default function ModalVerProducto({ producto, onClose }) {
    if (!producto) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            Detalle del producto
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Información completa del producto
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Contenido */}
                <div className="px-6 py-5 space-y-4">
                    {/* Imagen y nombre */}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            {producto.imagen ? (
                                <img
                                    src={producto.imagen}
                                    alt={producto.nombre}
                                    className="w-full h-full object-cover rounded-xl"
                                />
                            ) : (
                                <Package size={28} className="text-gray-400" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">
                                {producto.name || producto.nombre}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {producto.presentacion}
                            </p>
                            <div className="mt-1">
                                <EstadoBadge
                                    stockActual={producto.stockActual ?? 0}
                                    stockMinimo={producto.stockMinimo ?? 0}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Detalles */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">Código</p>
                            <p className="text-sm font-semibold text-gray-900">
                                {producto.codigo || "-"}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">
                                Viscosidad
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                                {producto.viscosity ||
                                    producto.viscosidad ||
                                    "-"}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">
                                Categoría
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                                {producto.category?.name ||
                                    producto.categoria ||
                                    "-"}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">Marca</p>
                            <p className="text-sm font-semibold text-gray-900">
                                {producto.brand?.name || producto.marca || "-"}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">
                                Stock actual
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                                {producto.stockActual ?? "-"} unid.
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">
                                Stock mínimo
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                                {producto.stockMinimo ?? "-"} unid.
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">Precio</p>
                            <p className="text-sm font-semibold text-cixoil-green">
                                S/.{" "}
                                {Number(
                                    producto.price || producto.precio || 0,
                                ).toFixed(2)}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">
                                Almacén
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                                {producto.almacen || "-"}
                            </p>
                        </div>
                    </div>

                    {/* Descripción */}
                    {(producto.description || producto.descripcion) && (
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">
                                Descripción
                            </p>
                            <p className="text-sm text-gray-700">
                                {producto.description || producto.descripcion}
                            </p>
                        </div>
                    )}

                    {/* Última actualización */}
                    {producto.ultimaActualizacion && (
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                            Última actualización: {producto.ultimaActualizacion}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}

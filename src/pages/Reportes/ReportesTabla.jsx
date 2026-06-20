export default function ReportesTabla({ reportes, loading, tipo }) {
    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <p className="text-gray-400 text-sm">Cargando reporte...</p>
            </div>
        );
    }

    if (!reportes.length) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <p className="text-gray-400 text-sm">
                    No hay datos disponibles para este reporte.
                </p>
            </div>
        );
    }

    if (tipo === "Inventario") {
        return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Vista móvil: cards */}
                <div className="lg:hidden divide-y divide-gray-100">
                    {reportes.map((item) => (
                        <div key={item.id} className="p-4">
                            <div className="flex items-center justify-between mb-1">
                                <p className="font-semibold text-gray-900">
                                    {item.product?.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {item.product?.categoryName || "-"}
                                </p>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>
                                    Stock:{" "}
                                    <span className="font-bold text-gray-900">
                                        {item.stock}
                                    </span>
                                </span>
                                <span>Stock minimo: {item.minStock}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Vista desktop: tabla */}
                <table className="w-full text-sm hidden lg:table">
                    <thead>
                        <tr className="bg-gray-50 border-b">
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                Producto
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                Categoria
                            </th>
                            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                Stock
                            </th>
                            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                Stock Minimo
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportes.map((item) => (
                            <tr
                                key={item.id}
                                className="border-b hover:bg-gray-50"
                            >
                                <td className="px-4 py-3 font-medium">
                                    {item.product?.name}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                    {item.product?.categoryName || "-"}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {item.stock}
                                </td>
                                <td className="px-4 py-3 text-center text-gray-500">
                                    {item.minStock}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="px-4 py-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                        Total registros: {reportes.length}
                    </p>
                </div>
            </div>
        );
    }

    if (tipo === "Movimientos") {
        return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Vista móvil: cards */}
                <div className="lg:hidden divide-y divide-gray-100">
                    {reportes.map((item) => (
                        <div key={item.id} className="p-4">
                            <div className="flex items-center justify-between mb-1">
                                <p className="font-semibold text-gray-900">
                                    {item.productName || item.product?.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {item.date || item.fecha}
                                </p>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>{item.type || item.tipo}</span>
                                <span>
                                    Cantidad:{" "}
                                    <span className="font-bold text-gray-900">
                                        {item.quantity || item.cantidad}
                                    </span>
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Vista desktop: tabla */}
                <table className="w-full text-sm hidden lg:table">
                    <thead>
                        <tr className="bg-gray-50 border-b">
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                Producto
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                Tipo
                            </th>
                            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                Cantidad
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                Fecha
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportes.map((item) => (
                            <tr
                                key={item.id}
                                className="border-b hover:bg-gray-50"
                            >
                                <td className="px-4 py-3 font-medium">
                                    {item.productName || item.product?.name}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                    {item.type || item.tipo}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {item.quantity || item.cantidad}
                                </td>
                                <td className="px-4 py-3 text-gray-500">
                                    {item.date || item.fecha}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="px-4 py-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                        Total registros: {reportes.length}
                    </p>
                </div>
            </div>
        );
    }

    if (tipo === "Compras") {
        return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Vista móvil: cards */}
                <div className="lg:hidden divide-y divide-gray-100">
                    {reportes.map((item) => (
                        <div key={item.id} className="p-4">
                            <div className="flex items-center justify-between mb-1">
                                <p className="font-semibold text-gray-900">
                                    OC-{item.id.toString().padStart(4, "0")}
                                </p>
                                <p className="font-bold text-cixoil-red text-sm">
                                    S/. {item.totalAmount || item.total}
                                </p>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>
                                    {item.supplierName || item.supplier?.name}
                                </span>
                                <span>{item.purchaseDate || item.fecha}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Vista desktop: tabla */}
                <table className="w-full text-sm hidden lg:table">
                    <thead>
                        <tr className="bg-gray-50 border-b">
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                Codigo
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                Proveedor
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                Fecha
                            </th>
                            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                Total
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportes.map((item) => (
                            <tr
                                key={item.id}
                                className="border-b hover:bg-gray-50"
                            >
                                <td className="px-4 py-3 font-medium">
                                    OC-{item.id.toString().padStart(4, "0")}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                    {item.supplierName || item.supplier?.name}
                                </td>
                                <td className="px-4 py-3 text-gray-500">
                                    {item.purchaseDate || item.fecha}
                                </td>
                                <td className="px-4 py-3 text-center font-semibold text-cixoil-red">
                                    S/. {item.totalAmount || item.total}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="px-4 py-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                        Total registros: {reportes.length}
                    </p>
                </div>
            </div>
        );
    }
}

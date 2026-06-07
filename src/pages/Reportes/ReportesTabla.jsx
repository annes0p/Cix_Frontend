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
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 border-b">
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                Producto
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                Categoría
                            </th>
                            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                Stock
                            </th>
                            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                Precio
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
                                    {item.name || item.nombre}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                    {item.categoryName || item.categoria}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {item.stock ?? item.quantity}
                                </td>
                                <td className="px-4 py-3 text-center font-semibold text-cixoil-red">
                                    S/. {item.price || item.precio}
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
                <table className="w-full text-sm">
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
                                    {item.productName || item.producto}
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
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 border-b">
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                Código
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
                                    {item.supplierName || item.proveedor}
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

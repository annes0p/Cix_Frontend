function EstadoBadge({ stock }) {
    if (stock === 0) {
        return (
            <span className="px-2 py-1 rounded-md text-xs font-semibold bg-red-100 text-red-700">
                Sin Stock
            </span>
        );
    }
    return (
        <span className="px-2 py-1 rounded-md text-xs font-semibold bg-orange-100 text-orange-700">
            Stock Bajo
        </span>
    );
}

export default function AlertasTabla({ alertas, loading }) {
    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <p className="text-gray-400 text-sm">Cargando alertas...</p>
            </div>
        );
    }

    if (!alertas.length) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <p className="text-gray-400 text-sm">
                    No existen alertas activas. Todo el stock esta en orden!
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Producto
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Categoria
                        </th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Stock Actual
                        </th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Stock Minimo
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Estado
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {alertas.map((alerta) => (
                        <tr
                            key={alerta.id}
                            className="border-b border-gray-100 hover:bg-gray-50"
                        >
                            <td className="px-4 py-3 font-semibold text-gray-900">
                                {alerta.product?.name}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                                {alerta.product?.categoryName || "-"}
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-red-600">
                                {alerta.stock}
                            </td>
                            <td className="px-4 py-3 text-center text-gray-600">
                                {alerta.minStock}
                            </td>
                            <td className="px-4 py-3">
                                <EstadoBadge stock={alerta.stock} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

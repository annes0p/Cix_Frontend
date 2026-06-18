function SegmentoBadge({ segmento }) {
    switch (segmento) {
        case "Frecuente":
            return (
                <span className="px-2 py-1 rounded-md text-xs font-semibold bg-green-100 text-green-700">
                    Frecuente
                </span>
            );
        case "Ocasional":
            return (
                <span className="px-2 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-700">
                    Ocasional
                </span>
            );
        default:
            return (
                <span className="px-2 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-600">
                    Nuevo
                </span>
            );
    }
}

export default function CRMTabla({
    clientes,
    loading,
    onSeleccionar,
    clienteSeleccionado,
}) {
    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <p className="text-gray-400 text-sm">Cargando clientes...</p>
            </div>
        );
    }

    if (!clientes.length) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <p className="text-gray-400 text-sm">
                    No hay clientes en este segmento.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-50 border-b">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Cliente
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Documento
                        </th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Compras
                        </th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Total gastado
                        </th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Segmento
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {clientes.map((cliente) => (
                        <tr
                            key={cliente.id}
                            onClick={() => onSeleccionar(cliente)}
                            className={`border-b cursor-pointer transition-all ${
                                clienteSeleccionado?.id === cliente.id
                                    ? "bg-cixoil-red/5 border-l-2 border-l-cixoil-red"
                                    : "hover:bg-gray-50"
                            }`}
                        >
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-cixoil-red/10 flex items-center justify-center text-xs font-black text-cixoil-red shrink-0">
                                        {cliente.name?.charAt(0)}
                                        {cliente.fatherLastName?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {cliente.name}{" "}
                                            {cliente.fatherLastName}{" "}
                                            {cliente.motherLastName}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {cliente.email}
                                        </p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-gray-600">
                                {cliente.docNumber}
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-gray-900">
                                {cliente.frecuencia}
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-cixoil-red">
                                S/. {cliente.totalGastado.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-center">
                                <SegmentoBadge segmento={cliente.segmento} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="px-4 py-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                    Total clientes: {clientes.length}
                </p>
            </div>
        </div>
    );
}

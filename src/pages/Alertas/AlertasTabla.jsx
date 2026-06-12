import { Minus, TrendingDown, TrendingUp } from "lucide-react";

function NivelBadge({ nivel }) {
    switch (nivel) {
        case "agotado":
            return (
                <span className="px-2 py-1 rounded-md text-xs font-semibold bg-red-100 text-red-700">
                    Sin stock
                </span>
            );
        case "critico":
            return (
                <span className="px-2 py-1 rounded-md text-xs font-semibold bg-orange-100 text-orange-700">
                    Stock critico
                </span>
            );
        case "advertencia":
            return (
                <span className="px-2 py-1 rounded-md text-xs font-semibold bg-yellow-100 text-yellow-700">
                    Advertencia
                </span>
            );
        case "baja_rotacion":
            return (
                <span className="px-2 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-700">
                    Baja rotacion
                </span>
            );
        default:
            return (
                <span className="px-2 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-700">
                    Normal
                </span>
            );
    }
}

function PrediccionBadge({ dias }) {
    if (dias === null) {
        return <span className="text-xs text-gray-400">Sin movimientos</span>;
    }
    if (dias === 0) {
        return (
            <span className="text-xs font-bold text-red-600">Agotado hoy</span>
        );
    }
    if (dias <= 3) {
        return (
            <span className="text-xs font-bold text-red-600">
                En {dias} dia{dias !== 1 ? "s" : ""}
            </span>
        );
    }
    if (dias <= 7) {
        return (
            <span className="text-xs font-bold text-orange-600">
                En {dias} dias
            </span>
        );
    }
    return (
        <span className="text-xs font-semibold text-yellow-600">
            En {dias} dias
        </span>
    );
}

function TendenciaBadge({ tendencia, porcentaje }) {
    if (tendencia === "subiendo") {
        return (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
                <TrendingUp size={14} />+{porcentaje}%
            </span>
        );
    }
    if (tendencia === "bajando") {
        return (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600">
                <TrendingDown size={14} />
                {porcentaje}%
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400">
            <Minus size={14} />
            Estable
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
                    No hay alertas para este filtro.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Vista móvil: cards */}
            <div className="lg:hidden divide-y divide-gray-100">
                {alertas.map((alerta) => (
                    <div key={alerta.id} className="p-4">
                        <div className="flex items-center justify-between mb-2 gap-2">
                            <p className="font-semibold text-gray-900 truncate">
                                {alerta.product?.name}
                            </p>
                            <NivelBadge nivel={alerta.nivelRiesgo} />
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                            <span>
                                Stock:{" "}
                                <span
                                    className={`font-black ${
                                        alerta.stock === 0
                                            ? "text-cixoil-red"
                                            : alerta.stock <= alerta.minStock
                                              ? "text-orange-600"
                                              : "text-yellow-600"
                                    }`}
                                >
                                    {alerta.stock}
                                </span>{" "}
                                / min {alerta.minStock}
                            </span>
                            <span>
                                {alerta.consumoDiario > 0
                                    ? `${alerta.consumoDiario} uds/dia`
                                    : "Sin datos"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <PrediccionBadge
                                dias={alerta.diasHastaAgotamiento}
                            />
                            <TendenciaBadge
                                tendencia={alerta.tendencia}
                                porcentaje={alerta.tendenciaPorcentaje}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Vista desktop: tabla */}
            <table className="w-full text-sm hidden lg:table">
                <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Producto
                        </th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Stock actual
                        </th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Stock minimo
                        </th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Consumo diario
                        </th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Tendencia
                        </th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Se agota
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
                            <td
                                className={`px-4 py-3 text-center font-black text-sm ${
                                    alerta.stock === 0
                                        ? "text-cixoil-red"
                                        : alerta.stock <= alerta.minStock
                                          ? "text-orange-600"
                                          : "text-yellow-600"
                                }`}
                            >
                                {alerta.stock}
                            </td>
                            <td className="px-4 py-3 text-center text-gray-500">
                                {alerta.minStock}
                            </td>
                            <td className="px-4 py-3 text-center text-gray-600">
                                {alerta.consumoDiario > 0
                                    ? `${alerta.consumoDiario} uds/dia`
                                    : "Sin datos"}
                            </td>
                            <td className="px-4 py-3 text-center">
                                <TendenciaBadge
                                    tendencia={alerta.tendencia}
                                    porcentaje={alerta.tendenciaPorcentaje}
                                />
                            </td>
                            <td className="px-4 py-3 text-center">
                                <PrediccionBadge
                                    dias={alerta.diasHastaAgotamiento}
                                />
                            </td>
                            <td className="px-4 py-3">
                                <NivelBadge nivel={alerta.nivelRiesgo} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="px-4 py-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                    Total alertas: {alertas.length}
                </p>
            </div>
        </div>
    );
}

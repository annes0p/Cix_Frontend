import {
    Loader2,
    Minus,
    Sparkles,
    TrendingDown,
    TrendingUp,
} from "lucide-react";
import { useState } from "react";

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
    if (dias === null)
        return <span className="text-xs text-gray-400">Sin movimientos</span>;
    if (dias === 0)
        return (
            <span className="text-xs font-bold text-red-600">Agotado hoy</span>
        );
    if (dias <= 3)
        return (
            <span className="text-xs font-bold text-red-600">
                En {dias} dia{dias !== 1 ? "s" : ""}
            </span>
        );
    if (dias <= 7)
        return (
            <span className="text-xs font-bold text-orange-600">
                En {dias} dias
            </span>
        );
    return (
        <span className="text-xs font-semibold text-yellow-600">
            En {dias} dias
        </span>
    );
}

function TendenciaBadge({ tendencia, porcentaje }) {
    if (tendencia === "subiendo")
        return (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
                <TrendingUp size={14} />+{porcentaje}%
            </span>
        );
    if (tendencia === "bajando")
        return (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600">
                <TrendingDown size={14} />
                {porcentaje}%
            </span>
        );
    return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400">
            <Minus size={14} />
            Estable
        </span>
    );
}

function ModalAnalisisIA({ alerta, onClose }) {
    const [analisis, setAnalisis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const analizar = async () => {
        try {
            setLoading(true);
            setError(null);

            const prompt = `Eres un sistema experto en gestión de inventario de lubricantes automotrices para la empresa CIXOIL S.A.C.
Analiza el siguiente producto con problemas de stock y proporciona una recomendación de reposición:

PRODUCTO: ${alerta.product?.name}
STOCK ACTUAL: ${alerta.stock} unidades
STOCK MÍNIMO: ${alerta.minStock} unidades
CONSUMO DIARIO PROMEDIO (últimos 14 días): ${alerta.consumoDiario} unidades/día
TENDENCIA DE DEMANDA: ${alerta.tendencia === "subiendo" ? `al alza (+${alerta.tendenciaPorcentaje}%)` : alerta.tendencia === "bajando" ? `a la baja (${alerta.tendenciaPorcentaje}%)` : "estable"}
DÍAS HASTA AGOTAMIENTO: ${alerta.diasHastaAgotamiento !== null ? `${alerta.diasHastaAgotamiento} días` : "sin datos de movimiento"}
NIVEL DE RIESGO: ${alerta.nivelRiesgo}

Responde ÚNICAMENTE con un JSON válido sin markdown ni texto adicional:
{
  "recomendacion": "<explicación breve y práctica de qué hacer>",
  "cantidadSugerida": <número entero de unidades a reponer>,
  "urgencia": "<INMEDIATA | ALTA | MEDIA>"
}`;

            const response = await fetch(
                "https://api.groq.com/openai/v1/chat/completions",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
                    },
                    body: JSON.stringify({
                        model: "llama-3.3-70b-versatile",
                        messages: [
                            {
                                role: "user",
                                content: prompt,
                            },
                        ],
                        temperature: 0.3,
                        max_tokens: 300,
                    }),
                },
            );

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content;
            if (!content) throw new Error("Sin respuesta de IA");

            const parsed = JSON.parse(
                content.replace(/```json|```/g, "").trim(),
            );
            setAnalisis(parsed);
        } catch (err) {
            console.error(err);
            setError("No se pudo obtener el análisis. Intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles size={18} className="text-cixoil-red" />
                        <h2 className="font-bold text-gray-800">Análisis IA</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-sm font-medium"
                    >
                        Cerrar
                    </button>
                </div>

                <div className="p-6">
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                            Producto
                        </p>
                        <p className="font-bold text-gray-900">
                            {alerta.product?.name}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>
                                Stock:{" "}
                                <span className="font-bold text-gray-800">
                                    {alerta.stock}
                                </span>
                            </span>
                            <span>Mínimo: {alerta.minStock}</span>
                            <span>{alerta.consumoDiario} uds/día</span>
                        </div>
                    </div>

                    {!analisis && !loading && (
                        <button
                            onClick={analizar}
                            className="w-full bg-cixoil-red text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-900 transition"
                        >
                            <Sparkles size={16} />
                            Analizar con IA
                        </button>
                    )}

                    {loading && (
                        <div className="flex flex-col items-center justify-center gap-2 py-6 text-gray-400">
                            <Loader2
                                size={24}
                                className="animate-spin text-cixoil-red"
                            />
                            <span className="text-sm">
                                Analizando con Llama 3.3...
                            </span>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                            {error}
                        </div>
                    )}

                    {analisis && (
                        <div className="space-y-3">
                            <div className="bg-gradient-to-br from-cixoil-red/5 to-transparent border border-cixoil-red/20 rounded-xl p-4">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                    Recomendación
                                </p>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    {analisis.recomendacion}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gray-50 rounded-xl p-3 text-center">
                                    <p className="text-xs text-gray-400 mb-1">
                                        Cantidad sugerida
                                    </p>
                                    <p className="text-xl font-black text-cixoil-red">
                                        {analisis.cantidadSugerida}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        unidades
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3 text-center">
                                    <p className="text-xs text-gray-400 mb-1">
                                        Urgencia
                                    </p>
                                    <p
                                        className={`text-sm font-black ${
                                            analisis.urgencia === "INMEDIATA"
                                                ? "text-cixoil-red"
                                                : analisis.urgencia === "ALTA"
                                                  ? "text-orange-600"
                                                  : "text-yellow-600"
                                        }`}
                                    >
                                        {analisis.urgencia}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function AlertasTabla({ alertas, loading }) {
    const [alertaIA, setAlertaIA] = useState(null);

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
        <>
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
                                                : alerta.stock <=
                                                    alerta.minStock
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
                            <button
                                onClick={() => setAlertaIA(alerta)}
                                className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-cixoil-red border border-cixoil-red/30 rounded-lg py-1.5 hover:bg-cixoil-red/5 transition"
                            >
                                <Sparkles size={13} />
                                Analizar con IA
                            </button>
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
                                Stock mínimo
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
                            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                Estado
                            </th>
                            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                IA
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
                                <td className="px-4 py-3 text-center">
                                    <button
                                        onClick={() => setAlertaIA(alerta)}
                                        className="inline-flex items-center gap-1 text-xs font-semibold text-cixoil-red hover:opacity-70 transition"
                                    >
                                        <Sparkles size={14} />
                                        Analizar
                                    </button>
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

            {alertaIA && (
                <ModalAnalisisIA
                    alerta={alertaIA}
                    onClose={() => setAlertaIA(null)}
                />
            )}
        </>
    );
}

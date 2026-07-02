import {
    Car,
    ChevronDown,
    ChevronRight,
    Loader2,
    MessageCircle,
    Search,
    Sparkles,
    X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
    getRecomendacion,
    getVehicleModels,
    getVehicleUseTypes,
} from "../../services/recomendadorService";

function ComboBox({ opciones, valor, onChange, placeholder, disabled, error }) {
    const [inputVal, setInputVal] = useState(valor || "");
    const [abierto, setAbierto] = useState(false);
    const ref = useRef(null);

    const opcionesFiltradas = opciones.filter((op) =>
        op.toLowerCase().includes(inputVal.toLowerCase()),
    );

    useEffect(() => {
        setInputVal(valor || "");
    }, [valor]);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setAbierto(false);
                if (!opciones.includes(inputVal)) {
                    setInputVal(valor || "");
                }
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [inputVal, valor, opciones]);

    const seleccionar = (op) => {
        setInputVal(op);
        setAbierto(false);
        onChange(op);
    };

    const limpiar = (e) => {
        e.stopPropagation();
        setInputVal("");
        onChange("");
    };

    return (
        <div ref={ref} className="relative">
            <div
                className={`flex items-center w-full border rounded-xl bg-gray-50 transition-all focus-within:ring-2 focus-within:ring-cixoil-red focus-within:bg-white ${
                    error ? "border-red-400 bg-red-50" : "border-gray-200"
                } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
            >
                <input
                    type="text"
                    className="flex-1 px-3 py-2.5 text-sm bg-transparent focus:outline-none"
                    placeholder={placeholder}
                    value={inputVal}
                    onChange={(e) => {
                        setInputVal(e.target.value);
                        setAbierto(true);
                        if (!e.target.value) onChange("");
                    }}
                    onFocus={() => setAbierto(true)}
                    disabled={disabled}
                />
                {inputVal && !disabled ? (
                    <button
                        type="button"
                        onClick={limpiar}
                        className="px-2 text-gray-400 hover:text-gray-600"
                    >
                        <X size={14} />
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() => !disabled && setAbierto((a) => !a)}
                        className="px-3 text-gray-400"
                    >
                        <ChevronDown size={14} />
                    </button>
                )}
            </div>

            {abierto && opcionesFiltradas.length > 0 && (
                <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {opcionesFiltradas.map((op) => (
                        <li
                            key={op}
                            onMouseDown={() => seleccionar(op)}
                            className={`px-3 py-2.5 text-sm cursor-pointer hover:bg-cixoil-red/5 hover:text-cixoil-red ${
                                op === valor
                                    ? "bg-cixoil-red/10 font-semibold text-cixoil-red"
                                    : "text-gray-700"
                            }`}
                        >
                            {op}
                        </li>
                    ))}
                </ul>
            )}

            {abierto && opcionesFiltradas.length === 0 && inputVal && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-3 text-xs text-gray-400">
                    No se encontraron opciones
                </div>
            )}
        </div>
    );
}

export default function Recomendador() {
    const [modelos, setModelos] = useState([]);
    const [tiposUso, setTiposUso] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    const [tipoVehiculo, setTipoVehiculo] = useState("");
    const [marca, setMarca] = useState("");
    const [modeloId, setModeloId] = useState("");
    const [modeloTexto, setModeloTexto] = useState("");
    const [tipoUsoId, setTipoUsoId] = useState("");

    const [resultado, setResultado] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorApi, setErrorApi] = useState(null);
    const [errores, setErrores] = useState({});

    const [analisisDetallado, setAnalisisDetallado] = useState(null);
    const [loadingAnalisis, setLoadingAnalisis] = useState(false);
    const [errorAnalisis, setErrorAnalisis] = useState(null);

    const [telefonoCliente, setTelefonoCliente] = useState("");
    const [errorTelefono, setErrorTelefono] = useState(null);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoadingData(true);
                const [mod, usos] = await Promise.all([
                    getVehicleModels(),
                    getVehicleUseTypes(),
                ]);
                setModelos(mod.filter((m) => m.status === 1));
                setTiposUso(usos);
            } catch (err) {
                console.error("Error al cargar datos:", err);
            } finally {
                setLoadingData(false);
            }
        };
        cargarDatos();
    }, []);

    const tiposVehiculo = [...new Set(modelos.map((m) => m.vehicleType?.name))]
        .filter(Boolean)
        .sort();

    const marcasFiltradas = [
        ...new Set(
            modelos
                .filter((m) => m.vehicleType?.name === tipoVehiculo)
                .map((m) => m.vehicleBrand?.name),
        ),
    ]
        .filter(Boolean)
        .sort();

    const modelosFiltrados = modelos.filter(
        (m) =>
            m.vehicleType?.name === tipoVehiculo &&
            m.vehicleBrand?.name === marca,
    );

    const opcionesModelo = modelosFiltrados.map((m) => ({
        label: `${m.model} ${m.year} — ${m.motorCC > 0 ? `${m.motorCC}cc` : "Electrico"} ${m.fuelType} ${m.transmissionType}`,
        id: m.id,
    }));

    const modeloSeleccionado = modelos.find((m) => m.id === Number(modeloId));

    const validar = () => {
        const nuevosErrores = {};
        if (!tipoVehiculo)
            nuevosErrores.tipoVehiculo = "Selecciona el tipo de vehiculo.";
        if (!marca) nuevosErrores.marca = "Selecciona la marca.";
        if (!modeloId) nuevosErrores.modeloId = "Selecciona el modelo.";
        if (!tipoUsoId) nuevosErrores.tipoUsoId = "Selecciona el tipo de uso.";
        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const buscar = async (e) => {
        e.preventDefault();
        if (!validar()) return;
        try {
            setLoading(true);
            setErrorApi(null);
            setResultado(null);
            setAnalisisDetallado(null);
            const data = await getRecomendacion(
                Number(modeloId),
                Number(tipoUsoId),
            );
            setResultado(data);
        } catch (err) {
            setErrorApi(
                "No se pudo obtener una recomendacion. Verifica que el servicio de IA este activo.",
            );
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const analizarDetallado = async () => {
        if (!resultado || !modeloSeleccionado) return;
        try {
            setLoadingAnalisis(true);
            setErrorAnalisis(null);

            const tipoUsoLabel =
                tiposUso.find((t) => t.value === Number(tipoUsoId))?.label ||
                "uso general";

            const prompt = `Eres un experto en lubricantes automotrices de CIXOIL S.A.C., empresa peruana especializada en aceites y lubricantes.

Un sistema de IA recomendó el siguiente aceite para un vehículo. Tu tarea es proporcionar un análisis técnico detallado y consejos prácticos.

VEHÍCULO:
- Marca y modelo: ${modeloSeleccionado.vehicleBrand?.name} ${modeloSeleccionado.model} ${modeloSeleccionado.year}
- Tipo: ${tipoVehiculo}
- Motor: ${modeloSeleccionado.motorCC > 0 ? `${modeloSeleccionado.motorCC}cc` : "Eléctrico"}
- Combustible: ${modeloSeleccionado.fuelType}
- Transmisión: ${modeloSeleccionado.transmissionType}
- Potencia: ${modeloSeleccionado.horsePower} HP
- Tipo de uso: ${tipoUsoLabel}

ACEITE RECOMENDADO: ${resultado.product?.name}
PRIORIDAD: ${resultado.priority}
RAZÓN INICIAL: ${resultado.reason}

Proporciona un análisis más detallado en español. Responde ÚNICAMENTE con JSON válido sin markdown:
{
  "beneficios": ["<beneficio 1>", "<beneficio 2>", "<beneficio 3>"],
  "intervalosCambio": "<cada cuántos km o meses se recomienda cambiar>",
  "consejo": "<consejo práctico adicional para este vehículo y uso específico>",
  "advertencia": "<alguna advertencia importante o null si no hay>"
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
                        messages: [{ role: "user", content: prompt }],
                        temperature: 0.3,
                        max_tokens: 500,
                    }),
                },
            );

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content;
            if (!content) throw new Error("Sin respuesta");

            const parsed = JSON.parse(
                content.replace(/```json|```/g, "").trim(),
            );
            setAnalisisDetallado(parsed);
        } catch (err) {
            console.error(err);
            setErrorAnalisis("No se pudo obtener el análisis detallado.");
        } finally {
            setLoadingAnalisis(false);
        }
    };

    const construirReporteWhatsApp = () => {
        const tipoUsoLabel =
            tiposUso.find((t) => t.value === Number(tipoUsoId))?.label || "-";

        const lineas = [
            "*CIXOIL S.A.C. - Reporte de recomendacion*",
            "",
            `Vehiculo: ${modeloSeleccionado?.vehicleBrand?.name} ${modeloSeleccionado?.model} ${modeloSeleccionado?.year}`,
            `Tipo de uso: ${tipoUsoLabel}`,
            "",
            `Aceite recomendado: ${resultado?.product?.name}`,
            `Prioridad: ${getPriorityLabel(resultado?.priority)}`,
            `Motivo: ${resultado?.reason}`,
        ];

        if (analisisDetallado?.beneficios?.length) {
            lineas.push("", "Beneficios:");
            analisisDetallado.beneficios.forEach((b) =>
                lineas.push(`- ${b}`),
            );
        }
        if (analisisDetallado?.intervalosCambio) {
            lineas.push(
                "",
                `Intervalo de cambio: ${analisisDetallado.intervalosCambio}`,
            );
        }
        if (analisisDetallado?.consejo) {
            lineas.push(`Consejo: ${analisisDetallado.consejo}`);
        }
        if (
            analisisDetallado?.advertencia &&
            analisisDetallado.advertencia !== "null"
        ) {
            lineas.push(`Advertencia: ${analisisDetallado.advertencia}`);
        }

        lineas.push("", "CIXOIL S.A.C. - Lubricantes y derivados");

        return lineas.join("\n");
    };

    const enviarPorWhatsApp = () => {
        const telefono = telefonoCliente.replace(/\D/g, "");
        if (telefono.length !== 9) {
            setErrorTelefono(
                "Ingresa un numero de celular valido (9 digitos).",
            );
            return;
        }
        setErrorTelefono(null);
        const texto = encodeURIComponent(construirReporteWhatsApp());
        window.open(`https://wa.me/51${telefono}?text=${texto}`, "_blank");
    };

    const selectClass = (campo) =>
        `w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cixoil-red bg-gray-50 focus:bg-white transition-all ${
            errores[campo] ? "border-red-400 bg-red-50" : "border-gray-200"
        }`;

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "HIGH":
                return "bg-red-100 text-red-700 border-red-200";
            case "MEDIUM":
                return "bg-yellow-100 text-yellow-700 border-yellow-200";
            case "LOW":
                return "bg-green-100 text-green-700 border-green-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const getPriorityLabel = (priority) => {
        switch (priority) {
            case "HIGH":
                return "Alta prioridad";
            case "MEDIUM":
                return "Prioridad media";
            case "LOW":
                return "Baja prioridad";
            default:
                return priority;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-cixoil-red">
                        Encuentra tu aceite ideal
                    </h1>
                    <p className="text-sm text-gray-500">
                        Recomendacion inteligente de lubricantes para tu vehiculo
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-cixoil-red/10 px-3 py-1.5 rounded-lg self-start sm:self-auto">
                    <Sparkles size={16} className="text-cixoil-red" />
                    <span className="text-xs font-semibold text-cixoil-red">
                        Powered by AI
                    </span>
                </div>
            </div>

            <div className="p-4 sm:p-6 max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-cixoil-red/10 rounded-xl flex items-center justify-center shrink-0">
                            <Car size={20} className="text-cixoil-red" />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-800">
                                Datos del vehiculo
                            </h2>
                            <p className="text-xs text-gray-500">
                                Escribe o selecciona para obtener tu recomendacion
                            </p>
                        </div>
                    </div>

                    {loadingData ? (
                        <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
                            <Loader2 size={20} className="animate-spin" />
                            <span className="text-sm">Cargando datos...</span>
                        </div>
                    ) : (
                        <form onSubmit={buscar} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                                        Tipo de vehiculo
                                    </label>
                                    <ComboBox
                                        opciones={tiposVehiculo}
                                        valor={tipoVehiculo}
                                        onChange={(val) => {
                                            setTipoVehiculo(val);
                                            setMarca("");
                                            setModeloId("");
                                            setModeloTexto("");
                                            setResultado(null);
                                            setAnalisisDetallado(null);
                                            setErrores({});
                                        }}
                                        placeholder="Ej: Sedan, SUV..."
                                        error={errores.tipoVehiculo}
                                    />
                                    {errores.tipoVehiculo && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {errores.tipoVehiculo}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                                        Marca
                                    </label>
                                    <ComboBox
                                        opciones={marcasFiltradas}
                                        valor={marca}
                                        onChange={(val) => {
                                            setMarca(val);
                                            setModeloId("");
                                            setModeloTexto("");
                                            setResultado(null);
                                            setAnalisisDetallado(null);
                                            setErrores({});
                                        }}
                                        placeholder="Ej: Toyota, Hyundai..."
                                        disabled={!tipoVehiculo}
                                        error={errores.marca}
                                    />
                                    {errores.marca && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {errores.marca}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                                    Modelo y año
                                </label>
                                <ComboBox
                                    opciones={opcionesModelo.map((o) => o.label)}
                                    valor={modeloTexto}
                                    onChange={(val) => {
                                        setModeloTexto(val);
                                        const encontrado = opcionesModelo.find(
                                            (o) => o.label === val,
                                        );
                                        setModeloId(
                                            encontrado ? String(encontrado.id) : "",
                                        );
                                        setResultado(null);
                                        setAnalisisDetallado(null);
                                        setErrores({});
                                    }}
                                    placeholder="Ej: Corolla 2020..."
                                    disabled={!marca}
                                    error={errores.modeloId}
                                />
                                {errores.modeloId && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {errores.modeloId}
                                    </p>
                                )}
                            </div>

                            {modeloSeleccionado && (
                                <div className="bg-gray-50 rounded-xl p-3 grid grid-cols-3 gap-3 text-xs">
                                    <div>
                                        <p className="text-gray-400 font-medium">Combustible</p>
                                        <p className="font-bold text-gray-800">
                                            {modeloSeleccionado.fuelType}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 font-medium">Potencia</p>
                                        <p className="font-bold text-gray-800">
                                            {modeloSeleccionado.horsePower} HP
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 font-medium">Transmision</p>
                                        <p className="font-bold text-gray-800">
                                            {modeloSeleccionado.transmissionType}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                                    Tipo de uso
                                </label>
                                <select
                                    className={selectClass("tipoUsoId")}
                                    value={tipoUsoId}
                                    onChange={(e) => {
                                        setTipoUsoId(e.target.value);
                                        setResultado(null);
                                        setAnalisisDetallado(null);
                                        setErrores({});
                                    }}
                                >
                                    <option value="">
                                        Seleccionar tipo de uso
                                    </option>
                                    {tiposUso.map((t) => (
                                        <option key={t.value} value={t.value}>
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                                {errores.tipoUsoId && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {errores.tipoUsoId}
                                    </p>
                                )}
                            </div>

                            {errorApi && (
                                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                    {errorApi}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || loadingData}
                                className="w-full bg-cixoil-red text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-900 transition shadow-lg shadow-cixoil-red/20 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2
                                            size={16}
                                            className="animate-spin"
                                        />
                                        Analizando con IA...
                                    </>
                                ) : (
                                    <>
                                        <Search size={16} />
                                        Encontrar mi aceite ideal
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                {resultado && (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles size={18} className="text-cixoil-red" />
                            <h2 className="font-bold text-gray-800">
                                Recomendacion de la IA
                            </h2>
                        </div>

                        <div className="bg-gradient-to-br from-cixoil-red/5 to-transparent border border-cixoil-red/20 rounded-xl p-5 mb-4">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                        Producto recomendado
                                    </p>
                                    <h3 className="text-xl font-black text-cixoil-red">
                                        {resultado.product?.name}
                                    </h3>
                                </div>
                                <span
                                    className={`text-xs font-bold px-3 py-1 rounded-full border shrink-0 self-start ${getPriorityColor(resultado.priority)}`}
                                >
                                    {getPriorityLabel(resultado.priority)}
                                </span>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 mb-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                Por que este aceite
                            </p>
                            <p className="text-sm text-gray-700 leading-relaxed">
                                {resultado.reason}
                            </p>
                        </div>

                        {/* Análisis detallado con Groq */}
                        {!analisisDetallado && !loadingAnalisis && (
                            <button
                                onClick={analizarDetallado}
                                className="w-full flex items-center justify-center gap-2 border border-cixoil-red/30 text-cixoil-red text-sm font-semibold py-2.5 rounded-xl hover:bg-cixoil-red/5 transition mb-4"
                            >
                                <Sparkles size={15} />
                                Análisis técnico detallado con IA
                            </button>
                        )}

                        {loadingAnalisis && (
                            <div className="flex items-center justify-center gap-2 py-4 text-gray-400 mb-4">
                                <Loader2 size={18} className="animate-spin text-cixoil-red" />
                                <span className="text-sm">Generando análisis técnico...</span>
                            </div>
                        )}

                        {errorAnalisis && (
                            <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-3 rounded-xl mb-4">
                                {errorAnalisis}
                            </div>
                        )}

                        {analisisDetallado && (
                            <div className="space-y-3 mb-4">
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                    <p className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-2">
                                        Beneficios clave
                                    </p>
                                    <ul className="space-y-1">
                                        {analisisDetallado.beneficios?.map((b, i) => (
                                            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                                <span className="text-green-500 font-bold shrink-0">✓</span>
                                                {b}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="bg-gray-50 rounded-xl p-3">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                            Intervalo de cambio
                                        </p>
                                        <p className="text-sm font-bold text-gray-800">
                                            {analisisDetallado.intervalosCambio}
                                        </p>
                                    </div>
                                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
                                            Consejo
                                        </p>
                                        <p className="text-sm text-gray-700">
                                            {analisisDetallado.consejo}
                                        </p>
                                    </div>
                                </div>

                                {analisisDetallado.advertencia &&
                                    analisisDetallado.advertencia !== "null" && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                                        <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wider mb-1">
                                            Advertencia
                                        </p>
                                        <p className="text-sm text-gray-700">
                                            {analisisDetallado.advertencia}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {analisisDetallado && (
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                    Enviar reporte al cliente
                                </p>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="tel"
                                        className={`flex-1 px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cixoil-red bg-white ${
                                            errorTelefono
                                                ? "border-red-400 bg-red-50"
                                                : "border-gray-200"
                                        }`}
                                        placeholder="Celular del cliente (ej: 987654321)"
                                        value={telefonoCliente}
                                        onChange={(e) => {
                                            setTelefonoCliente(
                                                e.target.value,
                                            );
                                            setErrorTelefono(null);
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={enviarPorWhatsApp}
                                        className="flex items-center justify-center gap-2 bg-green-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-green-700 transition shrink-0"
                                    >
                                        <MessageCircle size={16} />
                                        Enviar por WhatsApp
                                    </button>
                                </div>
                                {errorTelefono && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {errorTelefono}
                                    </p>
                                )}
                            </div>
                        )}

                        {modeloSeleccionado && (
                            <div className="flex items-center gap-2 text-xs text-gray-400 pt-3 border-t border-gray-100 overflow-x-auto whitespace-nowrap">
                                <Car size={14} className="shrink-0" />
                                <span>
                                    {modeloSeleccionado.vehicleBrand?.name}{" "}
                                    {modeloSeleccionado.model}{" "}
                                    {modeloSeleccionado.year}
                                </span>
                                <ChevronRight size={12} className="shrink-0" />
                                <span>
                                    {tiposUso.find((t) => t.value === Number(tipoUsoId))?.label}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

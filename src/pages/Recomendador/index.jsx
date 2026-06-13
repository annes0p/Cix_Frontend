import { Car, ChevronRight, Loader2, Search, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import {
    getRecomendacion,
    getVehicleModels,
    getVehicleUseTypes,
} from "../../services/recomendadorService";

export default function Recomendador() {
    const [modelos, setModelos] = useState([]);
    const [tiposUso, setTiposUso] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    const [tipoVehiculo, setTipoVehiculo] = useState("");
    const [marca, setMarca] = useState("");
    const [modeloId, setModeloId] = useState("");
    const [tipoUsoId, setTipoUsoId] = useState("");

    const [resultado, setResultado] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorApi, setErrorApi] = useState(null);
    const [errores, setErrores] = useState({});

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
                        Recomendacion inteligente de lubricantes para tu
                        vehiculo
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
                                Completa los campos para obtener tu
                                recomendacion
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
                                    <select
                                        className={selectClass("tipoVehiculo")}
                                        value={tipoVehiculo}
                                        onChange={(e) => {
                                            setTipoVehiculo(e.target.value);
                                            setMarca("");
                                            setModeloId("");
                                            setResultado(null);
                                            setErrores({});
                                        }}
                                    >
                                        <option value="">
                                            Seleccionar tipo
                                        </option>
                                        {tiposVehiculo.map((t) => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ))}
                                    </select>
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
                                    <select
                                        className={selectClass("marca")}
                                        value={marca}
                                        onChange={(e) => {
                                            setMarca(e.target.value);
                                            setModeloId("");
                                            setResultado(null);
                                            setErrores({});
                                        }}
                                        disabled={!tipoVehiculo}
                                    >
                                        <option value="">
                                            Seleccionar marca
                                        </option>
                                        {marcasFiltradas.map((m) => (
                                            <option key={m} value={m}>
                                                {m}
                                            </option>
                                        ))}
                                    </select>
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
                                <select
                                    className={selectClass("modeloId")}
                                    value={modeloId}
                                    onChange={(e) => {
                                        setModeloId(e.target.value);
                                        setResultado(null);
                                        setErrores({});
                                    }}
                                    disabled={!marca}
                                >
                                    <option value="">Seleccionar modelo</option>
                                    {modelosFiltrados.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.model} {m.year} —{" "}
                                            {m.motorCC > 0
                                                ? `${m.motorCC}cc`
                                                : "Electrico"}{" "}
                                            {m.fuelType} {m.transmissionType}
                                        </option>
                                    ))}
                                </select>
                                {errores.modeloId && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {errores.modeloId}
                                    </p>
                                )}
                            </div>

                            {modeloSeleccionado && (
                                <div className="bg-gray-50 rounded-xl p-3 grid grid-cols-3 gap-3 text-xs">
                                    <div>
                                        <p className="text-gray-400 font-medium">
                                            Combustible
                                        </p>
                                        <p className="font-bold text-gray-800">
                                            {modeloSeleccionado.fuelType}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 font-medium">
                                            Potencia
                                        </p>
                                        <p className="font-bold text-gray-800">
                                            {modeloSeleccionado.horsePower} HP
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 font-medium">
                                            Transmision
                                        </p>
                                        <p className="font-bold text-gray-800">
                                            {
                                                modeloSeleccionado.transmissionType
                                            }
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
                                    {
                                        tiposUso.find(
                                            (t) =>
                                                t.value === Number(tipoUsoId),
                                        )?.label
                                    }
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

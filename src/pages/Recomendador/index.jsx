import { Car, Loader2, Search, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import {
    getRecomendacion,
    getVehicleModels,
    getVehicleUseTypes,
} from "../../services/recomendadorService";

export default function Recomendador() {
    const [modelos, setModelos] = useState([]);
    const [tiposUso, setTiposUso] = useState([]);
    const [form, setForm] = useState({
        idVehicleModel: "",
        idVehicleUseType: "",
    });
    const [errores, setErrores] = useState({});
    const [resultado, setResultado] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [errorApi, setErrorApi] = useState(null);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoadingData(true);
                const [mod, usos] = await Promise.all([
                    getVehicleModels(),
                    getVehicleUseTypes(),
                ]);
                setModelos(mod);
                setTiposUso(usos);
            } catch (err) {
                console.error("Error al cargar datos:", err);
            } finally {
                setLoadingData(false);
            }
        };
        cargarDatos();
    }, []);

    const handleChange = (campo, valor) => {
        setForm((prev) => ({ ...prev, [campo]: valor }));
        setErrores((prev) => ({ ...prev, [campo]: null }));
        setResultado(null);
    };

    const validar = () => {
        const nuevosErrores = {};
        if (!form.idVehicleModel)
            nuevosErrores.idVehicleModel = "Selecciona un modelo de vehiculo.";
        if (!form.idVehicleUseType)
            nuevosErrores.idVehicleUseType = "Selecciona un tipo de uso.";
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
                Number(form.idVehicleModel),
                Number(form.idVehicleUseType),
            );
            setResultado(data);
        } catch (err) {
            setErrorApi(
                "No se pudo obtener una recomendacion. Intenta de nuevo.",
            );
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const inputClass = (campo) =>
        `w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cixoil-red ${
            errores[campo] ? "border-red-400 bg-red-50" : "border-gray-300"
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
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-cixoil-red">
                        Encuentra tu aceite ideal
                    </h1>
                    <p className="text-sm text-gray-500">
                        Recomendacion inteligente de lubricantes para tu
                        vehiculo
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-cixoil-red/10 px-3 py-1.5 rounded-lg">
                    <Sparkles size={16} className="text-cixoil-red" />
                    <span className="text-xs font-semibold text-cixoil-red">
                        Powered by AI
                    </span>
                </div>
            </div>

            <div className="p-6 max-w-2xl mx-auto">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-cixoil-red/10 rounded-xl flex items-center justify-center">
                            <Car size={20} className="text-cixoil-red" />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-800">
                                Datos del vehiculo
                            </h2>
                            <p className="text-xs text-gray-500">
                                Selecciona el modelo y tipo de uso
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
                            <div>
                                <label className="text-sm font-medium text-gray-600 mb-1 block">
                                    Modelo de vehiculo
                                </label>
                                <select
                                    className={inputClass("idVehicleModel")}
                                    value={form.idVehicleModel}
                                    onChange={(e) =>
                                        handleChange(
                                            "idVehicleModel",
                                            e.target.value,
                                        )
                                    }
                                >
                                    <option value="">Seleccionar modelo</option>
                                    {modelos.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.vehicleBrand?.name} {m.model}{" "}
                                            {m.year} — {m.motorCC}cc{" "}
                                            {m.fuelType}
                                        </option>
                                    ))}
                                </select>
                                {errores.idVehicleModel && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {errores.idVehicleModel}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-600 mb-1 block">
                                    Tipo de uso
                                </label>
                                <select
                                    className={inputClass("idVehicleUseType")}
                                    value={form.idVehicleUseType}
                                    onChange={(e) =>
                                        handleChange(
                                            "idVehicleUseType",
                                            e.target.value,
                                        )
                                    }
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
                                {errores.idVehicleUseType && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {errores.idVehicleUseType}
                                    </p>
                                )}
                            </div>

                            {errorApi && (
                                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-lg">
                                    {errorApi}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || loadingData}
                                className="w-full bg-cixoil-red text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50"
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
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles size={18} className="text-cixoil-red" />
                            <h2 className="font-bold text-gray-800">
                                Recomendacion de la IA
                            </h2>
                        </div>

                        <div className="bg-gradient-to-br from-cixoil-red/5 to-transparent border border-cixoil-red/20 rounded-xl p-5 mb-4">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                        Producto recomendado
                                    </p>
                                    <h3 className="text-xl font-black text-cixoil-red">
                                        {resultado.product?.name}
                                    </h3>
                                </div>
                                <span
                                    className={`text-xs font-bold px-3 py-1 rounded-full border shrink-0 ${getPriorityColor(resultado.priority)}`}
                                >
                                    {getPriorityLabel(resultado.priority)}
                                </span>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                Razon de la recomendacion
                            </p>
                            <p className="text-sm text-gray-700 leading-relaxed">
                                {resultado.reason}
                            </p>
                        </div>

                        {resultado.vehicleModel && (
                            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-xs text-gray-500">
                                <div>
                                    <span className="font-semibold">
                                        Modelo:
                                    </span>{" "}
                                    {resultado.vehicleModel?.model}{" "}
                                    {resultado.vehicleModel?.year}
                                </div>
                                <div>
                                    <span className="font-semibold">Uso:</span>{" "}
                                    {resultado.vehicleUseType?.name}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

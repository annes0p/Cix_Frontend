import { CheckCircle2, Loader2, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    calificarIncidencia,
    getIncidenciaParaCalificar,
} from "../../services/incidenciasService";

export default function CalificarIncidencia() {
    const { token } = useParams();
    const [data, setData] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const [seleccion, setSeleccion] = useState(0);
    const [hover, setHover] = useState(0);
    const [enviando, setEnviando] = useState(false);
    const [enviado, setEnviado] = useState(false);

    useEffect(() => {
        const cargar = async () => {
            try {
                setCargando(true);
                const res = await getIncidenciaParaCalificar(token);
                setData(res);
                if (res.rating) {
                    setSeleccion(res.rating);
                    setEnviado(true);
                }
            } catch (err) {
                console.error("Error al cargar incidencia:", err);
                setError(
                    "No se pudo encontrar esta incidencia. Verifica que el link sea correcto.",
                );
            } finally {
                setCargando(false);
            }
        };
        cargar();
    }, [token]);

    const handleCalificar = async (valor) => {
        setSeleccion(valor);
        try {
            setEnviando(true);
            await calificarIncidencia(token, valor);
            setEnviado(true);
        } catch (err) {
            console.error("Error al calificar:", err);
            setError("No se pudo enviar tu calificación. Intenta de nuevo.");
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-black text-cixoil-red">
                        CIXOIL S.A.C.
                    </h1>
                    <p className="text-sm text-gray-500">
                        Califica cómo resolvimos tu caso
                    </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    {cargando && (
                        <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-400">
                            <Loader2 size={24} className="animate-spin" />
                            <span className="text-sm">Cargando...</span>
                        </div>
                    )}

                    {!cargando && error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-4 rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    {!cargando && data && (
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                    Incidencia
                                </p>
                                <p className="font-bold text-gray-900">
                                    {data.titulo}
                                </p>
                            </div>

                            {data.resolutionNote && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                        Cómo se resolvió
                                    </p>
                                    <p className="text-sm text-gray-700 leading-relaxed bg-green-50 rounded-lg p-3 border border-green-100">
                                        {data.resolutionNote}
                                    </p>
                                </div>
                            )}

                            <div className="pt-2 border-t border-gray-100 text-center">
                                {enviado ? (
                                    <div className="flex flex-col items-center gap-2 py-2">
                                        <CheckCircle2
                                            size={32}
                                            className="text-cixoil-green"
                                        />
                                        <p className="text-sm font-semibold text-gray-700">
                                            ¡Gracias por tu calificación!
                                        </p>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((n) => (
                                                <Star
                                                    key={n}
                                                    size={22}
                                                    className={
                                                        n <= seleccion
                                                            ? "fill-yellow-400 text-yellow-400"
                                                            : "text-gray-300"
                                                    }
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-sm font-medium text-gray-600 mb-3">
                                            ¿Qué tan satisfecho quedaste con
                                            la solución?
                                        </p>
                                        <div className="flex justify-center gap-2">
                                            {[1, 2, 3, 4, 5].map((n) => (
                                                <button
                                                    key={n}
                                                    type="button"
                                                    disabled={enviando}
                                                    onMouseEnter={() =>
                                                        setHover(n)
                                                    }
                                                    onMouseLeave={() =>
                                                        setHover(0)
                                                    }
                                                    onClick={() =>
                                                        handleCalificar(n)
                                                    }
                                                    className="disabled:opacity-50"
                                                >
                                                    <Star
                                                        size={30}
                                                        className={
                                                            n <=
                                                            (hover ||
                                                                seleccion)
                                                                ? "fill-yellow-400 text-yellow-400"
                                                                : "text-gray-300"
                                                        }
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                        {enviando && (
                                            <p className="text-xs text-gray-400 mt-2">
                                                Enviando...
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <p className="text-center text-xs text-gray-400 mt-4">
                    CIXOIL S.A.C. - Lubricantes y derivados
                </p>
            </div>
        </div>
    );
}

import { Sparkles, X } from "lucide-react";
import { useState } from "react";
import {
    actualizarEstadoIncidencia,
    documentarResolucion,
    ESTADOS_INCIDENCIA,
} from "../../services/incidenciasService";

const TIPO_LABELS = {
    PRODUCTO_DANADO: "Producto dañado",
    ERROR_PEDIDO: "Error en pedido",
    DEVOLUCION: "Devolución",
    QUEJA_CLIENTE: "Queja de cliente",
    PROBLEMA_PROVEEDOR: "Problema con proveedor",
};

const PRIORIDAD_ESTILOS = {
    ALTA: "bg-red-100 text-red-700",
    MEDIA: "bg-yellow-100 text-yellow-700",
    BAJA: "bg-gray-100 text-gray-600",
};

const PRIORIDAD_LABELS = {
    ALTA: "Alta",
    MEDIA: "Media",
    BAJA: "Baja",
};

const formatFecha = (iso) =>
    iso
        ? new Date(iso).toLocaleString("es-PE", {
              dateStyle: "medium",
              timeStyle: "short",
          })
        : "-";

const ESTADOS_RESOLUCION = ["RESUELTA", "CERRADA"];

async function generarResumenIA(incidencia, documentacionRaw) {
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
                temperature: 0.3,
                messages: [
                    {
                        role: "system",
                        content: `Eres un asistente de gestión de incidencias para CIXOIL S.A.C., empresa distribuidora de lubricantes en Perú.
Tu tarea es tomar la descripción informal de cómo se resolvió una incidencia y convertirla en una documentación profesional, clara y estructurada.
Responde ÚNICAMENTE con el texto del resumen, sin markdown, sin títulos, sin asteriscos. Máximo 3 oraciones en español formal.`,
                    },
                    {
                        role: "user",
                        content: `Incidencia: "${incidencia.titulo}"
Tipo: ${TIPO_LABELS[incidencia.tipo] || incidencia.tipo}
Descripción del problema: "${incidencia.descripcion}"
Resolución informal del usuario: "${documentacionRaw}"

Genera un resumen profesional de la resolución.`,
                    },
                ],
            }),
        },
    );
    const data = await response.json();
    return data.choices[0].message.content.trim();
}

export default function ModalDetalleIncidencia({
    incidencia,
    onClose,
    onActualizar,
}) {
    const [estado, setEstado] = useState(incidencia.estado);
    const [documentacion, setDocumentacion] = useState(
        incidencia.documentacionResolucion || "",
    );
    const [guardando, setGuardando] = useState(false);
    const [errorDoc, setErrorDoc] = useState(null);
    const [generandoIA, setGenerandoIA] = useState(false);

    const requiereDocumentacion = ESTADOS_RESOLUCION.includes(estado);
    const yaEstabaResuelto = ESTADOS_RESOLUCION.includes(incidencia.estado);

    const handleGenerarResumenIA = async () => {
        if (!documentacion.trim()) {
            setErrorDoc(
                "Escribe algo primero para que la IA pueda generar el resumen.",
            );
            return;
        }
        try {
            setGenerandoIA(true);
            const resumen = await generarResumenIA(incidencia, documentacion);
            setDocumentacion(resumen);
            setErrorDoc(null);
        } catch (err) {
            console.error("Error al generar resumen con IA:", err);
            setErrorDoc("No se pudo generar el resumen. Intenta de nuevo.");
        } finally {
            setGenerandoIA(false);
        }
    };

    const handleGuardar = async () => {
        if (requiereDocumentacion && !documentacion.trim()) {
            setErrorDoc(
                "Documenta cómo se resolvió la incidencia antes de cerrarla.",
            );
            return;
        }
        try {
            setGuardando(true);
            if (requiereDocumentacion && !yaEstabaResuelto) {
                await documentarResolucion(incidencia.id, documentacion.trim());
            } else {
                await actualizarEstadoIncidencia(incidencia.id, estado);
            }
            onActualizar();
        } catch (error) {
            console.error("Error al actualizar incidencia:", error);
        } finally {
            setGuardando(false);
        }
    };

    const sinCambios =
        estado === incidencia.estado &&
        documentacion === (incidencia.documentacionResolucion || "");

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="font-bold text-gray-800 text-lg">
                        Detalle de incidencia
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                            Titulo
                        </p>
                        <p className="font-bold text-gray-900">
                            {incidencia.titulo}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                Tipo
                            </p>
                            <p className="text-sm text-gray-700">
                                {TIPO_LABELS[incidencia.tipo] ||
                                    incidencia.tipo}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                Prioridad
                            </p>
                            <span
                                className={`inline-block px-2 py-1 rounded-md text-xs font-semibold ${
                                    PRIORIDAD_ESTILOS[incidencia.prioridad] ||
                                    "bg-gray-100 text-gray-600"
                                }`}
                            >
                                {PRIORIDAD_LABELS[incidencia.prioridad] ||
                                    incidencia.prioridad}
                            </span>
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                            Descripcion
                        </p>
                        <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3">
                            {incidencia.descripcion}
                        </p>
                    </div>

                    {incidencia.relacionado?.tipo && (
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                Relacionado
                            </p>
                            <p className="text-sm text-gray-700">
                                {incidencia.relacionado.tipo}
                                {incidencia.relacionado.nombre
                                    ? ` — ${incidencia.relacionado.nombre}`
                                    : ""}
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                Reportado por
                            </p>
                            <p className="text-sm text-gray-700">
                                {incidencia.reportadoPor}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                Fecha de registro
                            </p>
                            <p className="text-sm text-gray-700">
                                {formatFecha(incidencia.createdAt)}
                            </p>
                        </div>
                    </div>

                    {incidencia.resolvedAt && (
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                Fecha de resolución
                            </p>
                            <p className="text-sm text-gray-700">
                                {formatFecha(incidencia.resolvedAt)}
                            </p>
                        </div>
                    )}

                    {incidencia.documentacionResolucion && (
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                Cómo se resolvió
                            </p>
                            <p className="text-sm text-gray-700 leading-relaxed bg-green-50 rounded-lg p-3 border border-green-100">
                                {incidencia.documentacionResolucion}
                            </p>
                        </div>
                    )}

                    <div className="pt-2 border-t border-gray-100 space-y-3">
                        <div>
                            <label className="text-sm font-medium text-gray-600 mb-1.5 block">
                                Cambiar estado
                            </label>
                            <select
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cixoil-red"
                                value={estado}
                                onChange={(e) => {
                                    setEstado(e.target.value);
                                    setErrorDoc(null);
                                }}
                            >
                                {ESTADOS_INCIDENCIA.map((e) => (
                                    <option key={e.value} value={e.value}>
                                        {e.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {requiereDocumentacion && (
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-sm font-medium text-gray-600">
                                        ¿Cómo se resolvió?{" "}
                                        <span className="text-cixoil-red">
                                            *
                                        </span>
                                    </label>
                                    {!yaEstabaResuelto && (
                                        <button
                                            type="button"
                                            onClick={handleGenerarResumenIA}
                                            disabled={generandoIA}
                                            className="flex items-center gap-1.5 text-xs font-medium text-cixoil-red hover:opacity-75 disabled:opacity-50 transition-opacity"
                                        >
                                            <Sparkles size={13} />
                                            {generandoIA
                                                ? "Generando..."
                                                : "Mejorar con IA"}
                                        </button>
                                    )}
                                </div>
                                <textarea
                                    rows={3}
                                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cixoil-red resize-none ${
                                        errorDoc
                                            ? "border-red-400 bg-red-50"
                                            : "border-gray-300"
                                    }`}
                                    placeholder="Describe cómo se documentó y resolvió la incidencia internamente..."
                                    value={documentacion}
                                    onChange={(e) => {
                                        setDocumentacion(e.target.value);
                                        setErrorDoc(null);
                                    }}
                                    readOnly={yaEstabaResuelto}
                                />
                                {errorDoc && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {errorDoc}
                                    </p>
                                )}
                                {yaEstabaResuelto && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        Esta incidencia ya fue documentada.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
                        >
                            Cerrar
                        </button>
                        <button
                            onClick={handleGuardar}
                            disabled={guardando || sinCambios}
                            className="px-5 py-2.5 rounded-lg text-sm font-medium bg-cixoil-red text-white hover:bg-red-900 disabled:opacity-50"
                        >
                            {guardando ? "Guardando..." : "Guardar cambios"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { X } from "lucide-react";
import { useState } from "react";
import {
    crearIncidencia,
    PRIORIDADES_INCIDENCIA,
    TIPOS_INCIDENCIA,
} from "../../services/incidenciasService";

const RELACIONADO_TIPOS = [
    { value: "", label: "Ninguno" },
    { value: "PRODUCTO", label: "Producto" },
    { value: "VENTA", label: "Venta" },
    { value: "ORDEN_COMPRA", label: "Orden de compra" },
    { value: "CLIENTE", label: "Cliente" },
    { value: "PROVEEDOR", label: "Proveedor" },
];

export default function ModalIncidencia({ onClose, onGuardar }) {
    const [form, setForm] = useState({
        titulo: "",
        tipo: "PRODUCTO_DANADO",
        descripcion: "",
        prioridad: "MEDIA",
        reportadoPor: "",
        relacionadoTipo: "",
        relacionadoNombre: "",
    });
    const [errores, setErrores] = useState({});
    const [guardando, setGuardando] = useState(false);

    const handleChange = (campo, valor) => {
        setForm((prev) => ({ ...prev, [campo]: valor }));
    };

    const inputClass = (campo) =>
        `w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cixoil-red ${
            errores[campo] ? "border-red-400 bg-red-50" : "border-gray-300"
        }`;

    const validar = () => {
        const nuevosErrores = {};
        if (!form.titulo.trim())
            nuevosErrores.titulo = "El titulo es obligatorio.";
        if (!form.descripcion.trim())
            nuevosErrores.descripcion = "La descripcion es obligatoria.";
        if (!form.reportadoPor.trim())
            nuevosErrores.reportadoPor = "Indica quien reporta.";
        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validar()) return;
        try {
            setGuardando(true);
            await crearIncidencia({
                titulo: form.titulo,
                tipo: form.tipo,
                descripcion: form.descripcion,
                prioridad: form.prioridad,
                reportadoPor: form.reportadoPor,
                relacionado: form.relacionadoTipo
                    ? {
                          tipo: form.relacionadoTipo,
                          id: null,
                          nombre: form.relacionadoNombre || null,
                      }
                    : { tipo: null, id: null, nombre: null },
            });
            onGuardar();
            onClose();
        } catch (error) {
            console.error("Error al crear incidencia:", error);
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="font-bold text-gray-800 text-lg">
                        Nueva incidencia
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Titulo
                        </label>
                        <input
                            type="text"
                            className={inputClass("titulo")}
                            value={form.titulo}
                            onChange={(e) =>
                                handleChange("titulo", e.target.value)
                            }
                            placeholder="Ej: Producto danado en recepcion"
                        />
                        {errores.titulo && (
                            <p className="text-xs text-red-500 mt-1">
                                {errores.titulo}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600">
                                Tipo
                            </label>
                            <select
                                className={inputClass("tipo")}
                                value={form.tipo}
                                onChange={(e) =>
                                    handleChange("tipo", e.target.value)
                                }
                            >
                                {TIPOS_INCIDENCIA.map((t) => (
                                    <option key={t.value} value={t.value}>
                                        {t.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">
                                Prioridad
                            </label>
                            <select
                                className={inputClass("prioridad")}
                                value={form.prioridad}
                                onChange={(e) =>
                                    handleChange("prioridad", e.target.value)
                                }
                            >
                                {PRIORIDADES_INCIDENCIA.map((p) => (
                                    <option key={p.value} value={p.value}>
                                        {p.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Descripcion
                        </label>
                        <textarea
                            className={inputClass("descripcion")}
                            rows={3}
                            value={form.descripcion}
                            onChange={(e) =>
                                handleChange("descripcion", e.target.value)
                            }
                            placeholder="Detalla la incidencia..."
                        />
                        {errores.descripcion && (
                            <p className="text-xs text-red-500 mt-1">
                                {errores.descripcion}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Reportado por
                        </label>
                        <input
                            type="text"
                            className={inputClass("reportadoPor")}
                            value={form.reportadoPor}
                            onChange={(e) =>
                                handleChange("reportadoPor", e.target.value)
                            }
                            placeholder="Ej: Almacen, Ventas, Sophia..."
                        />
                        {errores.reportadoPor && (
                            <p className="text-xs text-red-500 mt-1">
                                {errores.reportadoPor}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600">
                                Relacionado con (opcional)
                            </label>
                            <select
                                className={inputClass("relacionadoTipo")}
                                value={form.relacionadoTipo}
                                onChange={(e) =>
                                    handleChange(
                                        "relacionadoTipo",
                                        e.target.value,
                                    )
                                }
                            >
                                {RELACIONADO_TIPOS.map((r) => (
                                    <option key={r.value} value={r.value}>
                                        {r.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">
                                Referencia
                            </label>
                            <input
                                type="text"
                                className={inputClass("relacionadoNombre")}
                                value={form.relacionadoNombre}
                                onChange={(e) =>
                                    handleChange(
                                        "relacionadoNombre",
                                        e.target.value,
                                    )
                                }
                                placeholder="Ej: Edge 10W-40, VEN-0012..."
                                disabled={!form.relacionadoTipo}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={guardando}
                            className="px-5 py-2.5 rounded-lg text-sm font-medium bg-cixoil-red text-white hover:bg-red-900 disabled:opacity-50"
                        >
                            {guardando
                                ? "Guardando..."
                                : "Registrar incidencia"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

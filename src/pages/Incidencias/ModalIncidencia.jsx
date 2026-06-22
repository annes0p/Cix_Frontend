import { ChevronDown, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getClientes, getVentas } from "../../services/crmService";
import {
    crearIncidencia,
    PRIORIDAD_POR_TIPO,
    PRIORIDADES_INCIDENCIA,
    TIPOS_INCIDENCIA,
} from "../../services/incidenciasService";
import { getOrdenes, getProductos } from "../../services/ordenesService";
import { getProveedores } from "../../services/proveedoresService";

const RELACIONADO_TIPOS = [
    { value: "", label: "Ninguno" },
    { value: "PRODUCTO", label: "Producto" },
    { value: "VENTA", label: "Venta" },
    { value: "ORDEN_COMPRA", label: "Orden de compra" },
    { value: "CLIENTE", label: "Cliente" },
    { value: "PROVEEDOR", label: "Proveedor" },
];

function ComboBoxEntidad({ opciones, valor, onChange, placeholder, disabled }) {
    const [inputVal, setInputVal] = useState(valor?.nombre || "");
    const [abierto, setAbierto] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        setInputVal(valor?.nombre || "");
    }, [valor]);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target))
                setAbierto(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const opcionesFiltradas = opciones.filter((op) =>
        op.nombre.toLowerCase().includes(inputVal.toLowerCase()),
    );

    const seleccionar = (op) => {
        setInputVal(op.nombre);
        setAbierto(false);
        onChange(op);
    };

    return (
        <div ref={ref} className="relative">
            <div
                className={`flex items-center w-full border rounded-lg bg-white transition-all focus-within:ring-2 focus-within:ring-cixoil-red ${
                    disabled
                        ? "opacity-50 pointer-events-none border-gray-200"
                        : "border-gray-300"
                }`}
            >
                <input
                    type="text"
                    className="flex-1 px-3 py-2 text-sm bg-transparent focus:outline-none"
                    placeholder={placeholder}
                    value={inputVal}
                    onChange={(e) => {
                        setInputVal(e.target.value);
                        setAbierto(true);
                        if (!e.target.value) onChange(null);
                    }}
                    onFocus={() => setAbierto(true)}
                    disabled={disabled}
                />
                <ChevronDown
                    size={14}
                    className="px-2 text-gray-400 shrink-0"
                />
            </div>
            {abierto && opcionesFiltradas.length > 0 && (
                <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {opcionesFiltradas.map((op) => (
                        <li
                            key={op.id}
                            onMouseDown={() => seleccionar(op)}
                            className="px-3 py-2 text-sm cursor-pointer hover:bg-cixoil-red/5 hover:text-cixoil-red text-gray-700"
                        >
                            {op.nombre}
                        </li>
                    ))}
                </ul>
            )}
            {abierto && opcionesFiltradas.length === 0 && inputVal && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs text-gray-400">
                    No se encontraron resultados
                </div>
            )}
        </div>
    );
}

async function sugerirConIA(descripcion) {
    const tiposDisponibles = TIPOS_INCIDENCIA.map((t) => t.value).join(", ");
    const prioridadesDisponibles = ["ALTA", "MEDIA", "BAJA"].join(", ");

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
                temperature: 0.2,
                messages: [
                    {
                        role: "system",
                        content: `Eres un asistente de gestión de incidencias para CIXOIL S.A.C., empresa distribuidora de lubricantes. 
Analiza la descripción de una incidencia y determina el tipo y la prioridad más adecuados.

Tipos disponibles: ${tiposDisponibles}
- PRODUCTO_DANADO: producto físicamente dañado, fuga, rotura, mal estado
- ERROR_PEDIDO: pedido incorrecto, cantidad equivocada, producto equivocado
- DEVOLUCION: cliente devuelve producto, solicitud de devolución
- QUEJA_CLIENTE: reclamo, insatisfacción, queja de atención o servicio
- PROBLEMA_PROVEEDOR: retraso de proveedor, pedido incompleto de proveedor, problema de abastecimiento

Prioridades disponibles: ${prioridadesDisponibles}
- ALTA: impacto económico directo, cliente afectado inmediatamente, pérdida de stock
- MEDIA: requiere atención pero no es urgente, puede esperar resolución normal
- BAJA: informativo, sin impacto operativo inmediato

Responde ÚNICAMENTE con un JSON válido sin markdown ni explicaciones:
{"tipo": "TIPO_AQUI", "prioridad": "PRIORIDAD_AQUI", "razon": "explicación breve en español de máximo 15 palabras"}`,
                    },
                    {
                        role: "user",
                        content: `Descripción de la incidencia: "${descripcion}"`,
                    },
                ],
            }),
        },
    );

    const data = await response.json();
    const texto = data.choices[0].message.content.trim();
    return JSON.parse(texto);
}

export default function ModalIncidencia({ onClose, onGuardar }) {
    const [form, setForm] = useState({
        titulo: "",
        tipo: "PRODUCTO_DANADO",
        descripcion: "",
        prioridad: PRIORIDAD_POR_TIPO["PRODUCTO_DANADO"],
        reportadoPor: "Vendedor",
        relacionadoTipo: "",
        relacionadoSeleccionado: null,
    });
    const [errores, setErrores] = useState({});
    const [guardando, setGuardando] = useState(false);
    const [analizandoIA, setAnalizandoIA] = useState(false);
    const [sugerenciaIA, setSugerenciaIA] = useState(null);

    const [productos, setProductos] = useState([]);
    const [ventas, setVentas] = useState([]);
    const [ordenes, setOrdenes] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [cargandoEntidades, setCargandoEntidades] = useState(true);

    useEffect(() => {
        const cargarTodo = async () => {
            try {
                setCargandoEntidades(true);
                const [prod, vts, ords, cls, provs] = await Promise.all([
                    getProductos(),
                    getVentas(),
                    getOrdenes(),
                    getClientes(),
                    getProveedores(),
                ]);
                setProductos(prod);
                setVentas(vts);
                setOrdenes(ords);
                setClientes(cls);
                setProveedores(provs);
            } catch (err) {
                console.error("Error al cargar entidades:", err);
            } finally {
                setCargandoEntidades(false);
            }
        };
        cargarTodo();
    }, []);

    const opcionesPorTipo = () => {
        switch (form.relacionadoTipo) {
            case "PRODUCTO":
                return productos.map((p) => ({ id: p.id, nombre: p.name }));
            case "VENTA":
                return ventas.map((v) => ({
                    id: v.id,
                    nombre: `VEN-${v.id.toString().padStart(4, "0")}`,
                }));
            case "ORDEN_COMPRA":
                return ordenes.map((o) => ({
                    id: o.id,
                    nombre: `OC-${o.id.toString().padStart(4, "0")}`,
                }));
            case "CLIENTE":
                return clientes.map((c) => ({
                    id: c.id,
                    nombre: `${c.name} ${c.fatherLastName || ""}`.trim(),
                }));
            case "PROVEEDOR":
                return proveedores.map((p) => ({
                    id: p.id,
                    nombre: p.legalName,
                }));
            default:
                return [];
        }
    };

    const handleChange = (campo, valor) => {
        setForm((prev) => ({ ...prev, [campo]: valor }));
        setErrores((prev) => ({ ...prev, [campo]: null }));
    };

    const handleTipoChange = (valor) => {
        setForm((prev) => ({
            ...prev,
            tipo: valor,
            prioridad: PRIORIDAD_POR_TIPO[valor] || prev.prioridad,
        }));
        setErrores((prev) => ({ ...prev, tipo: null }));
        setSugerenciaIA(null);
    };

    const handleRelacionadoTipoChange = (valor) => {
        setForm((prev) => ({
            ...prev,
            relacionadoTipo: valor,
            relacionadoSeleccionado: null,
        }));
    };

    const handleSugerirIA = async () => {
        if (!form.descripcion.trim()) {
            setErrores((prev) => ({
                ...prev,
                descripcion:
                    "Escribe una descripción para que la IA pueda analizarla.",
            }));
            return;
        }
        try {
            setAnalizandoIA(true);
            setSugerenciaIA(null);
            const resultado = await sugerirConIA(form.descripcion);
            setSugerenciaIA(resultado);
            setForm((prev) => ({
                ...prev,
                tipo: resultado.tipo,
                prioridad: resultado.prioridad,
            }));
        } catch (err) {
            console.error("Error al analizar con IA:", err);
            setSugerenciaIA({
                error: "No se pudo analizar. Intenta de nuevo.",
            });
        } finally {
            setAnalizandoIA(false);
        }
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
                relacionado:
                    form.relacionadoTipo && form.relacionadoSeleccionado
                        ? {
                              tipo: form.relacionadoTipo,
                              id: form.relacionadoSeleccionado.id,
                              nombre: form.relacionadoSeleccionado.nombre,
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
                            placeholder="Ej: Producto dañado en recepcion"
                        />
                        {errores.titulo && (
                            <p className="text-xs text-red-500 mt-1">
                                {errores.titulo}
                            </p>
                        )}
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="text-sm font-medium text-gray-600">
                                Descripcion
                            </label>
                            <button
                                type="button"
                                onClick={handleSugerirIA}
                                disabled={analizandoIA}
                                className="flex items-center gap-1.5 text-xs font-medium text-cixoil-red hover:opacity-75 disabled:opacity-50 transition-opacity"
                            >
                                <Sparkles size={13} />
                                {analizandoIA
                                    ? "Analizando..."
                                    : "Sugerir tipo y prioridad con IA"}
                            </button>
                        </div>
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
                        {sugerenciaIA && !sugerenciaIA.error && (
                            <div className="mt-2 px-3 py-2 bg-cixoil-red/5 border border-cixoil-red/20 rounded-lg flex items-start gap-2">
                                <Sparkles
                                    size={13}
                                    className="text-cixoil-red mt-0.5 shrink-0"
                                />
                                <p className="text-xs text-gray-600">
                                    <span className="font-semibold text-cixoil-red">
                                        IA sugirió:
                                    </span>{" "}
                                    {sugerenciaIA.razon}
                                </p>
                            </div>
                        )}
                        {sugerenciaIA?.error && (
                            <p className="text-xs text-red-500 mt-1">
                                {sugerenciaIA.error}
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
                                    handleTipoChange(e.target.value)
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
                            Reportado por
                        </label>
                        <input
                            type="text"
                            className={inputClass("reportadoPor")}
                            value={form.reportadoPor}
                            onChange={(e) =>
                                handleChange("reportadoPor", e.target.value)
                            }
                            placeholder="Ej: Vendedor, Almacen, Sophia..."
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
                                    handleRelacionadoTipoChange(e.target.value)
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
                            <ComboBoxEntidad
                                opciones={opcionesPorTipo()}
                                valor={form.relacionadoSeleccionado}
                                onChange={(val) =>
                                    handleChange("relacionadoSeleccionado", val)
                                }
                                placeholder={
                                    cargandoEntidades
                                        ? "Cargando..."
                                        : "Buscar..."
                                }
                                disabled={
                                    !form.relacionadoTipo || cargandoEntidades
                                }
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

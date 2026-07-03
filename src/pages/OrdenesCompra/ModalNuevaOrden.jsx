import { Minus, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { crearOrden, getProductos } from "../../services/ordenesService";
import { getProveedores } from "../../services/proveedoresService";

export default function ModalNuevaOrden({ onClose, onGuardar }) {
    const hoy = new Date().toLocaleDateString("sv-SE");

    const [form, setForm] = useState({
        idSupplier: "",
        purchasedAt: hoy,
        estimatedDeliveryAt: "",
        deliveredAt: "",
        details: [],
    });
    const [proveedores, setProveedores] = useState([]);
    const [productos, setProductos] = useState([]);
    const [errores, setErrores] = useState({});
    const [loading, setLoading] = useState(false);
    const [errorApi, setErrorApi] = useState(null);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [prov, prod] = await Promise.all([
                    getProveedores(),
                    getProductos(),
                ]);
                setProveedores(prov);
                setProductos(prod);
            } catch (err) {
                console.error("Error al cargar datos:", err);
            }
        };
        cargarDatos();
    }, []);

    const handleChange = (campo, valor) => {
        setForm((prev) => ({ ...prev, [campo]: valor }));
        setErrores((prev) => ({ ...prev, [campo]: null }));
    };

    const agregarDetalle = () => {
        setForm((prev) => ({
            ...prev,
            details: [...prev.details, { idProduct: "", quantity: 1 }],
        }));
    };

    const actualizarDetalle = (index, campo, valor) => {
        setForm((prev) => {
            const nuevos = [...prev.details];
            nuevos[index] = { ...nuevos[index], [campo]: valor };
            return { ...prev, details: nuevos };
        });
    };

    const eliminarDetalle = (index) => {
        setForm((prev) => ({
            ...prev,
            details: prev.details.filter((_, i) => i !== index),
        }));
    };

    const validar = () => {
        const nuevosErrores = {};
        if (!form.idSupplier)
            nuevosErrores.idSupplier = "Selecciona un proveedor.";
        if (!form.purchasedAt)
            nuevosErrores.purchasedAt = "La fecha de compra es obligatoria.";
        if (
            form.estimatedDeliveryAt &&
            form.estimatedDeliveryAt < form.purchasedAt
        )
            nuevosErrores.estimatedDeliveryAt =
                "La entrega estimada no puede ser antes de la fecha de compra.";
        if (form.details.length === 0)
            nuevosErrores.details = "Agrega al menos un producto.";
        form.details.forEach((d, i) => {
            if (!d.idProduct)
                nuevosErrores[`idProduct_${i}`] = "Selecciona un producto.";
            if (!d.quantity || Number(d.quantity) <= 0)
                nuevosErrores[`quantity_${i}`] = "Cantidad invalida.";
        });
        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const guardar = async (e) => {
        e.preventDefault();
        if (!validar()) return;
        try {
            setLoading(true);
            setErrorApi(null);
            await crearOrden({
                idSupplier: Number(form.idSupplier),
                purchasedAt: form.purchasedAt,
                estimatedDeliveryAt: form.estimatedDeliveryAt || null,
                deliveredAt: form.deliveredAt || null,
                details: form.details.map((d) => ({
                    idProduct: Number(d.idProduct),
                    quantity: Number(d.quantity),
                })),
            });
            onGuardar();
            onClose();
        } catch (err) {
            setErrorApi("Error al guardar la orden. Intenta de nuevo.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const inputClass = (campo) =>
        `w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cixoil-red ${
            errores[campo] ? "border-red-400 bg-red-50" : "border-gray-200"
        }`;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center px-6 py-4 border-b">
                    <div>
                        <h2 className="font-bold text-lg">
                            Nueva Orden de Compra
                        </h2>
                        <p className="text-sm text-gray-500">
                            Registra una nueva compra
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X />
                    </button>
                </div>

                <form onSubmit={guardar} className="p-6 space-y-4">
                    {errorApi && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-lg">
                            {errorApi}
                        </div>
                    )}

                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Proveedor
                        </label>
                        <select
                            className={inputClass("idSupplier")}
                            value={form.idSupplier}
                            onChange={(e) =>
                                handleChange("idSupplier", e.target.value)
                            }
                        >
                            <option value="">Seleccionar proveedor</option>
                            {proveedores.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.legalName}
                                </option>
                            ))}
                        </select>
                        {errores.idSupplier && (
                            <p className="text-xs text-red-500 mt-1">
                                {errores.idSupplier}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Fecha de compra
                        </label>
                        <input
                            type="date"
                            className={inputClass("purchasedAt")}
                            value={form.purchasedAt}
                            min={hoy}
                            onChange={(e) =>
                                handleChange("purchasedAt", e.target.value)
                            }
                        />
                        {errores.purchasedAt && (
                            <p className="text-xs text-red-500 mt-1">
                                {errores.purchasedAt}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Entrega estimada
                        </label>
                        <input
                            type="date"
                            className={inputClass("estimatedDeliveryAt")}
                            value={form.estimatedDeliveryAt}
                            min={form.purchasedAt || hoy}
                            onChange={(e) =>
                                handleChange(
                                    "estimatedDeliveryAt",
                                    e.target.value,
                                )
                            }
                        />
                        {errores.estimatedDeliveryAt && (
                            <p className="text-xs text-red-500 mt-1">
                                {errores.estimatedDeliveryAt}
                            </p>
                        )}
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-gray-600">
                                Productos
                            </label>
                            <button
                                type="button"
                                onClick={agregarDetalle}
                                className="flex items-center gap-1 text-xs text-cixoil-green font-medium hover:opacity-80"
                            >
                                <Plus size={14} />
                                Agregar producto
                            </button>
                        </div>

                        {errores.details && (
                            <p className="text-xs text-red-500 mb-2">
                                {errores.details}
                            </p>
                        )}

                        {form.details.length === 0 && !errores.details && (
                            <p className="text-xs text-gray-400 text-center py-2">
                                No hay productos agregados.
                            </p>
                        )}

                        {form.details.map((detalle, index) => (
                            <div key={index} className="mb-2">
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <select
                                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cixoil-red ${
                                                errores[`idProduct_${index}`]
                                                    ? "border-red-400 bg-red-50"
                                                    : "border-gray-200"
                                            }`}
                                            value={detalle.idProduct}
                                            onChange={(e) =>
                                                actualizarDetalle(
                                                    index,
                                                    "idProduct",
                                                    e.target.value,
                                                )
                                            }
                                        >
                                            <option value="">
                                                Seleccionar producto
                                            </option>
                                            {productos.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errores[`idProduct_${index}`] && (
                                            <p className="text-xs text-red-500 mt-1">
                                                {errores[`idProduct_${index}`]}
                                            </p>
                                        )}
                                    </div>
                                    <div className="w-24">
                                        <input
                                            type="number"
                                            placeholder="Cant."
                                            min="1"
                                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cixoil-red ${
                                                errores[`quantity_${index}`]
                                                    ? "border-red-400 bg-red-50"
                                                    : "border-gray-200"
                                            }`}
                                            value={detalle.quantity}
                                            onChange={(e) =>
                                                actualizarDetalle(
                                                    index,
                                                    "quantity",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        {errores[`quantity_${index}`] && (
                                            <p className="text-xs text-red-500 mt-1">
                                                {errores[`quantity_${index}`]}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => eliminarDetalle(index)}
                                        className="text-red-400 hover:text-red-600 mt-1"
                                    >
                                        <Minus size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 border border-gray-300 rounded-lg py-2.5 text-sm"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-cixoil-red text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
                        >
                            {loading ? "Guardando..." : "Guardar Orden"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
    actualizarProducto,
    getCategorias,
    getMarcas,
} from "../../services/inventarioService";

export default function ModalEditarProducto({
    producto,
    onClose,
    onProductoActualizado,
}) {
    const [form, setForm] = useState({
        name: "",
        viscosity: "",
        description: "",
        image: null,
        price: "",
        idCategory: "",
        idBrand: "",
    });
    const [preview, setPreview] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [marcas, setMarcas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fileRef = useRef(null);

    useEffect(() => {
        if (producto) {
            setForm({
                name: producto.name || producto.nombre || "",
                viscosity: producto.viscosity || producto.viscosidad || "",
                description: producto.description || producto.descripcion || "",
                image: null,
                price: producto.price || producto.precio || "",
                idCategory: producto.category?.id || "",
                idBrand: producto.brand?.id || "",
            });
            setPreview(producto.imageUrl || null);
        }

        const cargarSelects = async () => {
            try {
                const [cats, brands] = await Promise.all([
                    getCategorias(),
                    getMarcas(),
                ]);
                setCategorias(cats);
                setMarcas(brands);
            } catch {
                setCategorias([]);
                setMarcas([]);
            }
        };
        cargarSelects();
    }, [producto]);

    const handleChange = (campo, valor) => {
        setForm((prev) => ({ ...prev, [campo]: valor }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setForm((prev) => ({ ...prev, image: file }));
        setPreview(URL.createObjectURL(file));
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const actualizado = await actualizarProducto(
                producto.idProducto || producto.id,
                {
                    ...form,
                    price: Number(form.price),
                    idCategory: Number(form.idCategory),
                    idBrand: Number(form.idBrand),
                },
            );
            onProductoActualizado(actualizado);
            onClose();
        } catch {
            setError("No se pudo actualizar el producto. Intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cixoil-red focus:border-transparent transition-all placeholder:text-gray-400";
    const labelClass =
        "block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            Editar producto
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Modifica los datos del producto
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleGuardar} className="px-6 py-5 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className={labelClass}>
                            Nombre del producto
                        </label>
                        <input
                            type="text"
                            placeholder="Ej: Aceite 15W40"
                            className={inputClass}
                            value={form.name}
                            onChange={(e) =>
                                handleChange("name", e.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Marca</label>
                            <select
                                className={inputClass}
                                value={form.idBrand}
                                onChange={(e) =>
                                    handleChange("idBrand", e.target.value)
                                }
                                required
                            >
                                <option value="">Seleccionar</option>
                                {marcas.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Categoría</label>
                            <select
                                className={inputClass}
                                value={form.idCategory}
                                onChange={(e) =>
                                    handleChange("idCategory", e.target.value)
                                }
                                required
                            >
                                <option value="">Seleccionar</option>
                                {categorias.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Viscosidad</label>
                            <input
                                type="text"
                                placeholder="Ej: 5W-40"
                                className={inputClass}
                                value={form.viscosity}
                                onChange={(e) =>
                                    handleChange("viscosity", e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Precio (S/.)</label>
                            <input
                                type="number"
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                className={inputClass}
                                value={form.price}
                                onChange={(e) =>
                                    handleChange("price", e.target.value)
                                }
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Descripción</label>
                        <textarea
                            placeholder="Descripción del producto..."
                            rows={3}
                            className={inputClass}
                            value={form.description}
                            onChange={(e) =>
                                handleChange("description", e.target.value)
                            }
                        />
                    </div>

                    <div>
                        <label className={labelClass}>
                            Imagen del producto
                        </label>
                        <div
                            onClick={() => fileRef.current?.click()}
                            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-cixoil-red transition-colors"
                        >
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="w-24 h-24 object-cover rounded-lg"
                                />
                            ) : (
                                <div className="text-center">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                                        <div className="w-5 h-5 bg-gray-300 rounded" />
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        Click para cambiar imagen
                                    </p>
                                    <p className="text-xs text-gray-300 mt-0.5">
                                        JPG, PNG, WEBP
                                    </p>
                                </div>
                            )}
                        </div>
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                        {form.image && (
                            <p className="text-xs text-gray-400 mt-1">
                                {form.image.name}
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-cixoil-red text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? "Guardando..." : "Guardar cambios"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

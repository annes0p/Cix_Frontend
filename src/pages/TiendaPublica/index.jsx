import {
    CheckCircle2,
    Loader2,
    Minus,
    Plus,
    Search,
    ShoppingCart,
    X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
    crearVentaPublica,
    getCatalogoPublico,
} from "../../services/publicSaleService";

const IGV = 0.18;

const formatSoles = (valor) =>
    (valor || 0).toLocaleString("es-PE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

export default function TiendaPublica() {
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [busqueda, setBusqueda] = useState("");

    const [carrito, setCarrito] = useState([]); // [{ producto, cantidad }]
    const [mostrarCheckout, setMostrarCheckout] = useState(false);

    const [form, setForm] = useState({
        name: "",
        fatherLastName: "",
        motherLastName: "",
        documentType: "DNI",
        docNumber: "",
        phoneNumber: "",
        email: "",
        address: "",
    });
    const [errores, setErrores] = useState({});
    const [enviando, setEnviando] = useState(false);
    const [errorEnvio, setErrorEnvio] = useState(null);
    const [confirmacion, setConfirmacion] = useState(null);

    useEffect(() => {
        const cargar = async () => {
            try {
                setCargando(true);
                const data = await getCatalogoPublico();
                setProductos(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error al cargar catálogo:", err);
                setError("No se pudo cargar el catálogo. Intenta de nuevo más tarde.");
            } finally {
                setCargando(false);
            }
        };
        cargar();
    }, []);

    const productosFiltrados = productos.filter((p) => {
        const texto = busqueda.trim().toLowerCase();
        if (!texto) return true;
        return (
            p.name?.toLowerCase().includes(texto) ||
            p.brandName?.toLowerCase().includes(texto) ||
            p.categoryName?.toLowerCase().includes(texto)
        );
    });

    const agregarAlCarrito = (producto) => {
        setCarrito((prev) => {
            const existente = prev.find((it) => it.producto.id === producto.id);
            if (existente) {
                return prev.map((it) =>
                    it.producto.id === producto.id
                        ? { ...it, cantidad: it.cantidad + 1 }
                        : it,
                );
            }
            return [...prev, { producto, cantidad: 1 }];
        });
    };

    const cambiarCantidad = (idProducto, delta) => {
        setCarrito((prev) =>
            prev
                .map((it) =>
                    it.producto.id === idProducto
                        ? { ...it, cantidad: it.cantidad + delta }
                        : it,
                )
                .filter((it) => it.cantidad > 0),
        );
    };

    const quitarDelCarrito = (idProducto) => {
        setCarrito((prev) => prev.filter((it) => it.producto.id !== idProducto));
    };

    const totalItems = useMemo(
        () => carrito.reduce((acc, it) => acc + it.cantidad, 0),
        [carrito],
    );

    const totales = useMemo(() => {
        const total = carrito.reduce(
            (acc, it) => acc + Number(it.producto.price || 0) * it.cantidad,
            0,
        );
        const subtotal = total / (1 + IGV);
        const igvMonto = total - subtotal;
        return { subtotal, igvMonto, total };
    }, [carrito]);

    const actualizarForm = (campo, valor) => {
        setForm((prev) => ({ ...prev, [campo]: valor }));
        setErrores((prev) => ({ ...prev, [campo]: null }));
    };

    const validarForm = () => {
        const nuevosErrores = {};
        if (!form.name.trim()) nuevosErrores.name = "El nombre es obligatorio.";
        if (!form.fatherLastName.trim())
            nuevosErrores.fatherLastName = "El apellido paterno es obligatorio.";
        if (!/^\d{8}$|^\d{11}$/.test(form.docNumber))
            nuevosErrores.docNumber =
                form.documentType === "RUC"
                    ? "El RUC debe tener 11 dígitos."
                    : "El DNI debe tener 8 dígitos.";
        if (!/^\d{6,9}$/.test(form.phoneNumber))
            nuevosErrores.phoneNumber = "Ingresa un teléfono válido (6 a 9 dígitos).";
        if (!form.address.trim())
            nuevosErrores.address = "La dirección es obligatoria.";
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            nuevosErrores.email = "El correo no tiene un formato válido.";
        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const enviarPedido = async () => {
        if (carrito.length === 0) return;
        if (!validarForm()) return;

        try {
            setEnviando(true);
            setErrorEnvio(null);
            const payload = {
                ...form,
                motherLastName: form.motherLastName || null,
                email: form.email || null,
                items: carrito.map((it) => ({
                    idProduct: it.producto.id,
                    quantity: it.cantidad,
                })),
            };
            const resultado = await crearVentaPublica(payload);
            setConfirmacion(resultado);
            setCarrito([]);
        } catch (err) {
            console.error("Error al registrar el pedido:", err);
            setErrorEnvio(
                err.response?.data?.message ||
                    "No se pudo registrar tu pedido. Intenta de nuevo.",
            );
        } finally {
            setEnviando(false);
        }
    };

    if (confirmacion) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center space-y-3">
                    <CheckCircle2 size={40} className="text-cixoil-green mx-auto" />
                    <h1 className="text-xl font-black text-cixoil-red">
                        ¡Pedido registrado!
                    </h1>
                    <p className="text-sm text-gray-600">{confirmacion.message}</p>
                    <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700">
                        <p>
                            Número de pedido:{" "}
                            <span className="font-semibold">
                                #{confirmacion.saleId}
                            </span>
                        </p>
                        <p>
                            Total estimado:{" "}
                            <span className="font-semibold">
                                S/. {formatSoles(confirmacion.total)}
                            </span>
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            setConfirmacion(null);
                            setMostrarCheckout(false);
                        }}
                        className="w-full py-2.5 rounded-xl bg-cixoil-red text-white font-semibold hover:opacity-90"
                    >
                        Volver a la tienda
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <div className="max-w-5xl mx-auto p-4">
                <div className="text-center mb-6 pt-4">
                    <h1 className="text-2xl font-black text-cixoil-red">
                        CIXOIL S.A.C.
                    </h1>
                    <p className="text-sm text-gray-500">
                        Tienda en línea — elige tus productos y coordinamos la entrega
                    </p>
                </div>

                <div className="relative mb-4">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        type="text"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Buscar por nombre, marca o categoría..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-cixoil-red/30"
                    />
                </div>

                {cargando && (
                    <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400">
                        <Loader2 size={24} className="animate-spin" />
                        <span className="text-sm">Cargando catálogo...</span>
                    </div>
                )}

                {!cargando && error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-4 rounded-xl text-center">
                        {error}
                    </div>
                )}

                {!cargando && !error && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {productosFiltrados.map((p) => (
                            <div
                                key={p.id}
                                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col gap-2"
                            >
                                {p.imageUrl && (
                                    <img
                                        src={p.imageUrl}
                                        alt={p.name}
                                        className="w-full h-32 object-cover rounded-xl bg-gray-100"
                                    />
                                )}
                                <div className="flex items-start justify-between gap-2">
                                    <p className="font-bold text-gray-900 text-sm">
                                        {p.name}
                                    </p>
                                    {p.viscosity && (
                                        <span className="text-[11px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full shrink-0">
                                            {p.viscosity}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-400">
                                    {p.brandName}
                                    {p.categoryName ? ` · ${p.categoryName}` : ""}
                                </p>
                                {p.description && (
                                    <p className="text-xs text-gray-500 line-clamp-2">
                                        {p.description}
                                    </p>
                                )}
                                <div className="flex items-center justify-between mt-auto pt-2">
                                    <span className="font-black text-cixoil-red">
                                        S/. {formatSoles(p.price)}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => agregarAlCarrito(p)}
                                        className="text-xs font-semibold bg-cixoil-red text-white px-3 py-1.5 rounded-lg hover:opacity-90"
                                    >
                                        Agregar
                                    </button>
                                </div>
                            </div>
                        ))}
                        {productosFiltrados.length === 0 && (
                            <p className="text-sm text-gray-400 col-span-full text-center py-10">
                                No se encontraron productos.
                            </p>
                        )}
                    </div>
                )}
            </div>

            {totalItems > 0 && !mostrarCheckout && (
                <button
                    type="button"
                    onClick={() => setMostrarCheckout(true)}
                    className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-cixoil-red text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:opacity-90"
                >
                    <ShoppingCart size={18} />
                    Ver pedido ({totalItems}) — S/. {formatSoles(totales.total)}
                </button>
            )}

            {mostrarCheckout && (
                <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <h2 className="font-bold text-gray-900">Tu pedido</h2>
                            <button
                                type="button"
                                onClick={() => setMostrarCheckout(false)}
                            >
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>

                        <div className="p-4 space-y-3">
                            {carrito.length === 0 && (
                                <p className="text-sm text-gray-400 text-center py-6">
                                    Tu carrito está vacío.
                                </p>
                            )}
                            {carrito.map((it) => (
                                <div
                                    key={it.producto.id}
                                    className="flex items-center justify-between gap-2 bg-gray-50 rounded-xl p-3"
                                >
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 truncate">
                                            {it.producto.name}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            S/. {formatSoles(it.producto.price)} c/u
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                cambiarCantidad(it.producto.id, -1)
                                            }
                                            className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="text-sm font-semibold w-5 text-center">
                                            {it.cantidad}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                cambiarCantidad(it.producto.id, 1)
                                            }
                                            className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center"
                                        >
                                            <Plus size={14} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                quitarDelCarrito(it.producto.id)
                                            }
                                            className="text-gray-300 hover:text-red-500 ml-1"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {carrito.length > 0 && (
                                <div className="text-sm text-gray-600 border-t border-gray-100 pt-3 space-y-1">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span>S/. {formatSoles(totales.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>IGV (18%)</span>
                                        <span>S/. {formatSoles(totales.igvMonto)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-gray-900 text-base pt-1">
                                        <span>Total</span>
                                        <span>S/. {formatSoles(totales.total)}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {carrito.length > 0 && (
                            <div className="p-4 border-t border-gray-100 space-y-3">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Tus datos
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="col-span-2">
                                        <input
                                            type="text"
                                            placeholder="Nombres *"
                                            value={form.name}
                                            onChange={(e) =>
                                                actualizarForm("name", e.target.value)
                                            }
                                            className={`w-full px-3 py-2 rounded-lg border text-sm ${errores.name ? "border-red-400" : "border-gray-200"}`}
                                        />
                                        {errores.name && (
                                            <p className="text-xs text-red-500 mt-0.5">
                                                {errores.name}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="Apellido paterno *"
                                            value={form.fatherLastName}
                                            onChange={(e) =>
                                                actualizarForm(
                                                    "fatherLastName",
                                                    e.target.value,
                                                )
                                            }
                                            className={`w-full px-3 py-2 rounded-lg border text-sm ${errores.fatherLastName ? "border-red-400" : "border-gray-200"}`}
                                        />
                                        {errores.fatherLastName && (
                                            <p className="text-xs text-red-500 mt-0.5">
                                                {errores.fatherLastName}
                                            </p>
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Apellido materno"
                                        value={form.motherLastName}
                                        onChange={(e) =>
                                            actualizarForm(
                                                "motherLastName",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                    />
                                    <select
                                        value={form.documentType}
                                        onChange={(e) =>
                                            actualizarForm(
                                                "documentType",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                    >
                                        <option value="DNI">DNI</option>
                                        <option value="RUC">RUC</option>
                                    </select>
                                    <div>
                                        <input
                                            type="text"
                                            placeholder={
                                                form.documentType === "RUC"
                                                    ? "N° de RUC *"
                                                    : "N° de DNI *"
                                            }
                                            value={form.docNumber}
                                            onChange={(e) =>
                                                actualizarForm(
                                                    "docNumber",
                                                    e.target.value,
                                                )
                                            }
                                            className={`w-full px-3 py-2 rounded-lg border text-sm ${errores.docNumber ? "border-red-400" : "border-gray-200"}`}
                                        />
                                        {errores.docNumber && (
                                            <p className="text-xs text-red-500 mt-0.5">
                                                {errores.docNumber}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="Teléfono *"
                                            value={form.phoneNumber}
                                            onChange={(e) =>
                                                actualizarForm(
                                                    "phoneNumber",
                                                    e.target.value,
                                                )
                                            }
                                            className={`w-full px-3 py-2 rounded-lg border text-sm ${errores.phoneNumber ? "border-red-400" : "border-gray-200"}`}
                                        />
                                        {errores.phoneNumber && (
                                            <p className="text-xs text-red-500 mt-0.5">
                                                {errores.phoneNumber}
                                            </p>
                                        )}
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="Correo (opcional)"
                                        value={form.email}
                                        onChange={(e) =>
                                            actualizarForm("email", e.target.value)
                                        }
                                        className={`w-full px-3 py-2 rounded-lg border text-sm ${errores.email ? "border-red-400" : "border-gray-200"}`}
                                    />
                                    <div className="col-span-2">
                                        <input
                                            type="text"
                                            placeholder="Dirección de entrega *"
                                            value={form.address}
                                            onChange={(e) =>
                                                actualizarForm(
                                                    "address",
                                                    e.target.value,
                                                )
                                            }
                                            className={`w-full px-3 py-2 rounded-lg border text-sm ${errores.address ? "border-red-400" : "border-gray-200"}`}
                                        />
                                        {errores.address && (
                                            <p className="text-xs text-red-500 mt-0.5">
                                                {errores.address}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {errorEnvio && (
                                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                        {errorEnvio}
                                    </p>
                                )}

                                <button
                                    type="button"
                                    disabled={enviando}
                                    onClick={enviarPedido}
                                    className="w-full py-3 rounded-xl bg-cixoil-red text-white font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {enviando && (
                                        <Loader2 size={16} className="animate-spin" />
                                    )}
                                    Confirmar pedido
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

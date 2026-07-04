import {
    ArrowLeft,
    CheckCircle2,
    CreditCard,
    Disc,
    Droplet,
    FlaskConical,
    Layers,
    Loader2,
    Minus,
    Plus,
    Search,
    Settings,
    ShieldCheck,
    ShoppingCart,
    Smartphone,
    Sparkles,
    SprayCan,
    Thermometer,
    Waves,
    X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { buscarClienteExistente } from "../../services/clientPortalService";
import {
    buscarDocumentoPublico,
    crearVentaPublica,
    getCatalogoPublico,
} from "../../services/publicSaleService";

const IGV = 0.18;

// En vez de depender de fotos de producto (varian mucho en calidad),
// cada categoria tiene un icono y color propios para que las tarjetas
// se vean prolijas y consistentes sin necesitar imagenes reales.
const ESTILO_CATEGORIA = {
    "Aceites de motor": { icono: Droplet, bg: "bg-red-50", color: "text-cixoil-red" },
    "Aceites de transmisión": { icono: Settings, bg: "bg-blue-50", color: "text-blue-600" },
    "Grasas lubricantes": { icono: Layers, bg: "bg-amber-50", color: "text-amber-600" },
    "Refrigerantes y anticongelantes": { icono: Thermometer, bg: "bg-cyan-50", color: "text-cyan-600" },
    "Líquidos de freno": { icono: Disc, bg: "bg-orange-50", color: "text-orange-600" },
    "Aditivos automotrices": { icono: FlaskConical, bg: "bg-purple-50", color: "text-purple-600" },
    "Limpieza y mantenimiento": { icono: Sparkles, bg: "bg-green-50", color: "text-green-600" },
    "Lubricantes en aerosol": { icono: SprayCan, bg: "bg-pink-50", color: "text-pink-600" },
    "Fluidos hidráulicos": { icono: Waves, bg: "bg-indigo-50", color: "text-indigo-600" },
};
const ESTILO_DEFAULT = { icono: Droplet, bg: "bg-gray-50", color: "text-gray-500" };

const formatSoles = (valor) =>
    (valor || 0).toLocaleString("es-PE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

export default function TiendaPublica() {
    const [searchParams] = useSearchParams();
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
    const [avisoStock, setAvisoStock] = useState(null);

    const [verificandoDoc, setVerificandoDoc] = useState(false);
    const [estadoDoc, setEstadoDoc] = useState(null); // "cliente" | "verificado" | "no-verificado" | null

    // Paso de pago simulado (aun no hay pasarela real conectada, pero se
    // simula el flujo casi tal cual seria con Culqi: tarjeta o Yape,
    // validando formato y con una demora de "procesando" antes de aprobar).
    const [pasoCheckout, setPasoCheckout] = useState("datos"); // "datos" | "pago"
    const [metodoPago, setMetodoPago] = useState("CARD"); // "CARD" | "YAPE"
    const [tarjeta, setTarjeta] = useState({
        numero: "",
        vencimiento: "",
        cvv: "",
        nombre: "",
    });
    const [yape, setYape] = useState({
        telefono: "",
        codigoGenerado: false,
        segundosRestantes: 0,
        codigo: "",
    });
    const [erroresPago, setErroresPago] = useState({});
    const [procesandoPago, setProcesandoPago] = useState(false);
    const [pagoAprobado, setPagoAprobado] = useState(false);
    // Guarda sincrona (no depende de que React re-renderice) para que un
    // doble clic en "Pagar" no dispare dos pedidos: asi se evitaron
    // clientes duplicados con el mismo DNI en pruebas anteriores.
    const pagoEnCursoRef = useRef(false);

    useEffect(() => {
        if (!yape.codigoGenerado || yape.segundosRestantes <= 0) return;
        const id = setTimeout(() => {
            setYape((prev) => ({
                ...prev,
                segundosRestantes: prev.segundosRestantes - 1,
            }));
        }, 1000);
        return () => clearTimeout(id);
    }, [yape.codigoGenerado, yape.segundosRestantes]);

    // Al terminar de escribir el DNI/RUC (llega al largo exacto):
    // 1) primero busca si ya es cliente nuestro -> si si, autocompleta
    //    todo (nombre, telefono, direccion) para no hacerlo repetir datos.
    // 2) si no es cliente nuestro, consulta apiperu.dev (SUNAT) solo
    //    para autocompletar el nombre. Si no hay resultado en ninguno
    //    de los dos, no bloquea nada, solo sigue en modo manual.
    useEffect(() => {
        const maxLargo = form.documentType === "RUC" ? 11 : 8;
        if (form.docNumber.length !== maxLargo) {
            setEstadoDoc(null);
            return;
        }

        let cancelado = false;

        const verificar = async () => {
            try {
                setVerificandoDoc(true);
                const cliente = await buscarClienteExistente(form.docNumber);
                if (cancelado) return;

                if (cliente.found) {
                    setForm((prev) => ({
                        ...prev,
                        name: cliente.name || prev.name,
                        fatherLastName: cliente.fatherLastName || prev.fatherLastName,
                        motherLastName: cliente.motherLastName || prev.motherLastName,
                        phoneNumber: cliente.phoneNumber || prev.phoneNumber,
                        email: cliente.email || prev.email,
                        address: cliente.address || prev.address,
                    }));
                    setEstadoDoc("cliente");
                    return;
                }

                const doc = await buscarDocumentoPublico(
                    form.documentType,
                    form.docNumber,
                );
                if (cancelado) return;

                if (doc.found) {
                    setForm((prev) => ({
                        ...prev,
                        name: doc.name || prev.name,
                        fatherLastName: doc.fatherLastName || prev.fatherLastName,
                        motherLastName: doc.motherLastName || prev.motherLastName,
                    }));
                    setEstadoDoc("verificado");
                } else {
                    setEstadoDoc("no-verificado");
                }
            } catch (err) {
                console.error("Error al verificar documento:", err);
                if (!cancelado) setEstadoDoc(null);
            } finally {
                if (!cancelado) setVerificandoDoc(false);
            }
        };

        verificar();

        return () => {
            cancelado = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.docNumber, form.documentType]);

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

    // Si venimos desde el Recomendador con ?add=ID, agregamos ese
    // producto al carrito automáticamente y abrimos el resumen.
    useEffect(() => {
        const idParaAgregar = searchParams.get("add");
        if (!idParaAgregar || productos.length === 0) return;

        const producto = productos.find(
            (p) => String(p.id) === String(idParaAgregar),
        );
        if (producto) {
            setCarrito((prev) => {
                const yaExiste = prev.some((it) => it.producto.id === producto.id);
                if (yaExiste) return prev;
                return [...prev, { producto, cantidad: 1 }];
            });
            setMostrarCheckout(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productos]);

    const productosFiltrados = productos.filter((p) => {
        const texto = busqueda.trim().toLowerCase();
        if (!texto) return true;
        return (
            p.name?.toLowerCase().includes(texto) ||
            p.brandName?.toLowerCase().includes(texto) ||
            p.categoryName?.toLowerCase().includes(texto)
        );
    });

    // El stock que llega del catalogo publico refleja el inventario real
    // al momento de cargar la pagina; se usa para no dejar agregar al
    // carrito mas unidades de las que hay disponibles (antes esto solo
    // se validaba recien al final, en el backend, y la persona llegaba
    // hasta el paso de pago sin enterarse de que iba a fallar).
    const stockDisponible = (producto) =>
        producto.stock === null || producto.stock === undefined
            ? Infinity
            : Number(producto.stock);

    const agregarAlCarrito = (producto) => {
        const maxStock = stockDisponible(producto);
        if (maxStock <= 0) {
            setAvisoStock(`${producto.name} no tiene stock disponible.`);
            return;
        }
        setCarrito((prev) => {
            const existente = prev.find((it) => it.producto.id === producto.id);
            const cantidadActual = existente ? existente.cantidad : 0;
            if (cantidadActual + 1 > maxStock) {
                setAvisoStock(
                    `Solo hay ${maxStock} unidad(es) disponibles de ${producto.name}.`,
                );
                return prev;
            }
            setAvisoStock(null);
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
        setCarrito((prev) => {
            const actual = prev.find((it) => it.producto.id === idProducto);
            if (delta > 0 && actual) {
                const maxStock = stockDisponible(actual.producto);
                if (actual.cantidad + delta > maxStock) {
                    setAvisoStock(
                        `Solo hay ${maxStock} unidad(es) disponibles de ${actual.producto.name}.`,
                    );
                    return prev;
                }
            }
            setAvisoStock(null);
            return prev
                .map((it) =>
                    it.producto.id === idProducto
                        ? { ...it, cantidad: it.cantidad + delta }
                        : it,
                )
                .filter((it) => it.cantidad > 0);
        });
    };

    // Permite escribir la cantidad directamente (ademas de las flechitas).
    // Se deja escribir libremente mientras el campo esta enfocado (incluso
    // vacio momentaneamente) y recien se recorta entre 1 y el stock
    // disponible cuando el usuario termina de editar (onBlur), para no
    // pelear con el usuario mientras borra el numero para escribir uno
    // nuevo.
    const escribirCantidad = (idProducto, valor) => {
        const soloDigitos = valor.replace(/\D/g, "");
        setCarrito((prev) =>
            prev.map((it) =>
                it.producto.id === idProducto
                    ? { ...it, cantidad: soloDigitos === "" ? "" : Number(soloDigitos) }
                    : it,
            ),
        );
    };

    const confirmarCantidadEscrita = (idProducto) => {
        setCarrito((prev) => {
            const actual = prev.find((it) => it.producto.id === idProducto);
            if (!actual) return prev;
            const maxStock = stockDisponible(actual.producto);
            let cantidadFinal = Number(actual.cantidad) || 0;
            if (cantidadFinal < 1) cantidadFinal = 1;
            if (cantidadFinal > maxStock) {
                cantidadFinal = maxStock;
                setAvisoStock(
                    `Solo hay ${maxStock} unidad(es) disponibles de ${actual.producto.name}.`,
                );
            }
            return prev.map((it) =>
                it.producto.id === idProducto
                    ? { ...it, cantidad: cantidadFinal }
                    : it,
            );
        });
    };

    const quitarDelCarrito = (idProducto) => {
        setCarrito((prev) => prev.filter((it) => it.producto.id !== idProducto));
    };

    const totalItems = useMemo(
        () => carrito.reduce((acc, it) => acc + (Number(it.cantidad) || 0), 0),
        [carrito],
    );

    const totales = useMemo(() => {
        const total = carrito.reduce(
            (acc, it) =>
                acc + Number(it.producto.price || 0) * (Number(it.cantidad) || 0),
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

    // El campo de documento y telefono solo aceptan digitos, y se
    // recortan al largo maximo real (8 DNI / 11 RUC, 9 telefono) para
    // que no se pueda escribir un numero absurdamente largo como en
    // la prueba que hizo Moxi.
    const actualizarDocNumber = (valor) => {
        const soloDigitos = valor.replace(/\D/g, "");
        const maxLargo = form.documentType === "RUC" ? 11 : 8;
        actualizarForm("docNumber", soloDigitos.slice(0, maxLargo));
    };

    const actualizarTelefono = (valor) => {
        const soloDigitos = valor.replace(/\D/g, "");
        actualizarForm("phoneNumber", soloDigitos.slice(0, 9));
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

    const irAPago = () => {
        if (!validarForm()) return;
        setPasoCheckout("pago");
    };

    // Algoritmo de Luhn, para que la validacion de tarjeta se sienta real
    // (rechaza numeros con digitos al azar) aunque el cobro sea simulado.
    const luhnValido = (numero) => {
        const digitos = numero.replace(/\D/g, "");
        if (digitos.length !== 16) return false;
        let suma = 0;
        let duplicar = false;
        for (let i = digitos.length - 1; i >= 0; i--) {
            let d = parseInt(digitos[i], 10);
            if (duplicar) {
                d *= 2;
                if (d > 9) d -= 9;
            }
            suma += d;
            duplicar = !duplicar;
        }
        return suma % 10 === 0;
    };

    const actualizarNumeroTarjeta = (valor) => {
        const digitos = valor.replace(/\D/g, "").slice(0, 16);
        const conEspacios = digitos.replace(/(.{4})/g, "$1 ").trim();
        setTarjeta((prev) => ({ ...prev, numero: conEspacios }));
        setErroresPago((prev) => ({ ...prev, numero: null }));
    };

    const actualizarVencimiento = (valor) => {
        let digitos = valor.replace(/\D/g, "").slice(0, 4);
        if (digitos.length >= 3) {
            digitos = `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
        }
        setTarjeta((prev) => ({ ...prev, vencimiento: digitos }));
        setErroresPago((prev) => ({ ...prev, vencimiento: null }));
    };

    const generarCodigoYape = () => {
        if (!/^\d{9}$/.test(yape.telefono)) {
            setErroresPago((prev) => ({
                ...prev,
                yapeTelefono: "Ingresa un celular Yape válido (9 dígitos).",
            }));
            return;
        }
        setYape((prev) => ({
            ...prev,
            codigoGenerado: true,
            segundosRestantes: 120,
            codigo: "",
        }));
        setErroresPago((prev) => ({ ...prev, yapeTelefono: null }));
    };

    const validarPago = () => {
        const nuevosErrores = {};
        if (metodoPago === "CARD") {
            if (!luhnValido(tarjeta.numero))
                nuevosErrores.numero = "Número de tarjeta inválido.";
            const [mes, anio] = tarjeta.vencimiento.split("/");
            const venceValido =
                mes &&
                anio &&
                anio.length === 2 &&
                Number(mes) >= 1 &&
                Number(mes) <= 12;
            if (!venceValido) {
                nuevosErrores.vencimiento = "Vencimiento inválido (MM/AA).";
            } else {
                const ahora = new Date();
                const anioCompleto = 2000 + Number(anio);
                const vencida =
                    anioCompleto < ahora.getFullYear() ||
                    (anioCompleto === ahora.getFullYear() &&
                        Number(mes) < ahora.getMonth() + 1);
                if (vencida) nuevosErrores.vencimiento = "La tarjeta está vencida.";
            }
            if (!/^\d{3,4}$/.test(tarjeta.cvv))
                nuevosErrores.cvv = "CVV inválido.";
            if (!tarjeta.nombre.trim())
                nuevosErrores.nombre = "Ingresa el nombre del titular.";
        } else {
            if (!yape.codigoGenerado)
                nuevosErrores.yapeTelefono = "Primero genera el código.";
            else if (!/^\d{6}$/.test(yape.codigo))
                nuevosErrores.yapeCodigo = "Ingresa el código de aprobación (6 dígitos).";
            else if (yape.segundosRestantes <= 0)
                nuevosErrores.yapeCodigo = "El código venció, genera uno nuevo.";
        }
        setErroresPago(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const procesarPago = async () => {
        if (pagoEnCursoRef.current) return;
        if (!validarPago()) return;

        setErrorEnvio(null);
        pagoEnCursoRef.current = true;
        setProcesandoPago(true);
        // Simula la demora de comunicarse con la pasarela (Culqi) mientras
        // se conecta de verdad; la experiencia se siente igual para probar
        // el flujo completo sin generar cobros reales.
        await new Promise((resolve) => setTimeout(resolve, 1600));
        setProcesandoPago(false);
        setPagoAprobado(true);
        await new Promise((resolve) => setTimeout(resolve, 900));

        await enviarPedido();
    };

    const enviarPedido = async () => {
        if (carrito.length === 0) return;

        try {
            setEnviando(true);
            setErrorEnvio(null);
            const payload = {
                ...form,
                motherLastName: form.motherLastName || null,
                email: form.email || null,
                paymentMethod: metodoPago,
                items: carrito.map((it) => ({
                    idProduct: it.producto.id,
                    quantity: Number(it.cantidad) || 1,
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
            setPagoAprobado(false);
            pagoEnCursoRef.current = false;
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
                            setPasoCheckout("datos");
                            setPagoAprobado(false);
                            setYape({
                                telefono: "",
                                codigoGenerado: false,
                                segundosRestantes: 0,
                                codigo: "",
                            });
                            setTarjeta({
                                numero: "",
                                vencimiento: "",
                                cvv: "",
                                nombre: "",
                            });
                            pagoEnCursoRef.current = false;
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
                        {productosFiltrados.map((p) => {
                            const estilo =
                                ESTILO_CATEGORIA[p.categoryName] || ESTILO_DEFAULT;
                            const Icono = estilo.icono;
                            return (
                                <div
                                    key={p.id}
                                    className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col gap-2"
                                >
                                    <div
                                        className={`w-full h-20 rounded-xl flex items-center justify-center ${estilo.bg}`}
                                    >
                                        <Icono size={32} className={estilo.color} />
                                    </div>
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
                                            disabled={stockDisponible(p) <= 0}
                                            className="text-xs font-semibold bg-cixoil-red text-white px-3 py-1.5 rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            {stockDisponible(p) <= 0
                                                ? "Sin stock"
                                                : "Agregar"}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
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
                            <div className="flex items-center gap-2">
                                {pasoCheckout === "pago" &&
                                    !enviando &&
                                    !procesandoPago &&
                                    !pagoAprobado && (
                                    <button
                                        type="button"
                                        onClick={() => setPasoCheckout("datos")}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <ArrowLeft size={18} />
                                    </button>
                                )}
                                <h2 className="font-bold text-gray-900">
                                    {pasoCheckout === "pago"
                                        ? "Pago"
                                        : "Tu pedido"}
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setMostrarCheckout(false)}
                            >
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>

                        {pasoCheckout === "pago" && (
                            <div className="p-4 space-y-4">
                                <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                                    <span className="text-sm text-gray-500">
                                        Total a pagar
                                    </span>
                                    <span className="font-black text-lg text-cixoil-red">
                                        S/. {formatSoles(totales.total)}
                                    </span>
                                </div>

                                {pagoAprobado ? (
                                    <div className="flex flex-col items-center gap-2 py-8">
                                        <CheckCircle2
                                            size={40}
                                            className="text-cixoil-green"
                                        />
                                        <p className="font-semibold text-gray-800">
                                            ¡Pago aprobado!
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Registrando tu pedido...
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        {errorEnvio && (
                                            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                                {errorEnvio}
                                            </p>
                                        )}
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setMetodoPago("CARD");
                                                    setErroresPago({});
                                                }}
                                                disabled={procesandoPago}
                                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold border ${
                                                    metodoPago === "CARD"
                                                        ? "bg-cixoil-red text-white border-cixoil-red"
                                                        : "bg-white text-gray-600 border-gray-200"
                                                }`}
                                            >
                                                <CreditCard size={15} />
                                                Tarjeta
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setMetodoPago("YAPE");
                                                    setErroresPago({});
                                                }}
                                                disabled={procesandoPago}
                                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold border ${
                                                    metodoPago === "YAPE"
                                                        ? "bg-cixoil-red text-white border-cixoil-red"
                                                        : "bg-white text-gray-600 border-gray-200"
                                                }`}
                                            >
                                                <Smartphone size={15} />
                                                Yape
                                            </button>
                                        </div>

                                        {metodoPago === "CARD" && (
                                            <div className="space-y-2">
                                                <div>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        placeholder="Número de tarjeta"
                                                        value={tarjeta.numero}
                                                        disabled={procesandoPago}
                                                        onChange={(e) =>
                                                            actualizarNumeroTarjeta(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className={`w-full px-3 py-2 rounded-lg border text-sm ${erroresPago.numero ? "border-red-400" : "border-gray-200"}`}
                                                    />
                                                    {erroresPago.numero && (
                                                        <p className="text-xs text-red-500 mt-0.5">
                                                            {erroresPago.numero}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <input
                                                            type="text"
                                                            inputMode="numeric"
                                                            placeholder="MM/AA"
                                                            value={
                                                                tarjeta.vencimiento
                                                            }
                                                            disabled={
                                                                procesandoPago
                                                            }
                                                            onChange={(e) =>
                                                                actualizarVencimiento(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className={`w-full px-3 py-2 rounded-lg border text-sm ${erroresPago.vencimiento ? "border-red-400" : "border-gray-200"}`}
                                                        />
                                                        {erroresPago.vencimiento && (
                                                            <p className="text-xs text-red-500 mt-0.5">
                                                                {
                                                                    erroresPago.vencimiento
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <input
                                                            type="text"
                                                            inputMode="numeric"
                                                            maxLength={4}
                                                            placeholder="CVV"
                                                            value={tarjeta.cvv}
                                                            disabled={
                                                                procesandoPago
                                                            }
                                                            onChange={(e) =>
                                                                setTarjeta(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        cvv: e.target.value.replace(
                                                                            /\D/g,
                                                                            "",
                                                                        ).slice(0, 4),
                                                                    }),
                                                                )
                                                            }
                                                            className={`w-full px-3 py-2 rounded-lg border text-sm ${erroresPago.cvv ? "border-red-400" : "border-gray-200"}`}
                                                        />
                                                        {erroresPago.cvv && (
                                                            <p className="text-xs text-red-500 mt-0.5">
                                                                {erroresPago.cvv}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <input
                                                        type="text"
                                                        placeholder="Nombre del titular"
                                                        value={tarjeta.nombre}
                                                        disabled={procesandoPago}
                                                        onChange={(e) =>
                                                            setTarjeta((prev) => ({
                                                                ...prev,
                                                                nombre: e.target
                                                                    .value,
                                                            }))
                                                        }
                                                        className={`w-full px-3 py-2 rounded-lg border text-sm ${erroresPago.nombre ? "border-red-400" : "border-gray-200"}`}
                                                    />
                                                    {erroresPago.nombre && (
                                                        <p className="text-xs text-red-500 mt-0.5">
                                                            {erroresPago.nombre}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {metodoPago === "YAPE" && (
                                            <div className="space-y-2">
                                                <div>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            inputMode="numeric"
                                                            maxLength={9}
                                                            placeholder="Celular Yape"
                                                            value={yape.telefono}
                                                            disabled={
                                                                yape.codigoGenerado ||
                                                                procesandoPago
                                                            }
                                                            onChange={(e) =>
                                                                setYape((prev) => ({
                                                                    ...prev,
                                                                    telefono: e.target.value
                                                                        .replace(
                                                                            /\D/g,
                                                                            "",
                                                                        )
                                                                        .slice(0, 9),
                                                                }))
                                                            }
                                                            className={`flex-1 px-3 py-2 rounded-lg border text-sm ${erroresPago.yapeTelefono ? "border-red-400" : "border-gray-200"}`}
                                                        />
                                                        {!yape.codigoGenerado && (
                                                            <button
                                                                type="button"
                                                                onClick={
                                                                    generarCodigoYape
                                                                }
                                                                className="shrink-0 text-xs font-semibold bg-gray-800 text-white px-3 py-2 rounded-lg"
                                                            >
                                                                Generar código
                                                            </button>
                                                        )}
                                                    </div>
                                                    {erroresPago.yapeTelefono && (
                                                        <p className="text-xs text-red-500 mt-0.5">
                                                            {
                                                                erroresPago.yapeTelefono
                                                            }
                                                        </p>
                                                    )}
                                                </div>

                                                {yape.codigoGenerado && (
                                                    <div>
                                                        <input
                                                            type="text"
                                                            inputMode="numeric"
                                                            maxLength={6}
                                                            placeholder="Código de aprobación (6 dígitos)"
                                                            value={yape.codigo}
                                                            disabled={
                                                                procesandoPago
                                                            }
                                                            onChange={(e) =>
                                                                setYape((prev) => ({
                                                                    ...prev,
                                                                    codigo: e.target.value
                                                                        .replace(
                                                                            /\D/g,
                                                                            "",
                                                                        )
                                                                        .slice(0, 6),
                                                                }))
                                                            }
                                                            className={`w-full px-3 py-2 rounded-lg border text-sm ${erroresPago.yapeCodigo ? "border-red-400" : "border-gray-200"}`}
                                                        />
                                                        {erroresPago.yapeCodigo && (
                                                            <p className="text-xs text-red-500 mt-0.5">
                                                                {
                                                                    erroresPago.yapeCodigo
                                                                }
                                                            </p>
                                                        )}
                                                        <p
                                                            className={`text-xs mt-1 ${yape.segundosRestantes > 0 ? "text-gray-400" : "text-red-500"}`}
                                                        >
                                                            {yape.segundosRestantes >
                                                            0
                                                                ? `Ingresa el código de tu app Yape · vence en ${Math.floor(yape.segundosRestantes / 60)}:${String(yape.segundosRestantes % 60).padStart(2, "0")}`
                                                                : "El código venció, genera uno nuevo."}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            disabled={procesandoPago}
                                            onClick={procesarPago}
                                            className="w-full py-3 rounded-xl bg-cixoil-red text-white font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {procesandoPago && (
                                                <Loader2
                                                    size={16}
                                                    className="animate-spin"
                                                />
                                            )}
                                            {procesandoPago
                                                ? "Procesando pago..."
                                                : `Pagar S/. ${formatSoles(totales.total)}`}
                                        </button>

                                        <p className="flex items-center justify-center gap-1 text-[11px] text-gray-400">
                                            <ShieldCheck size={12} />
                                            Pago simulado para pruebas — no se
                                            realiza ningún cobro real
                                        </p>
                                    </>
                                )}
                            </div>
                        )}

                        {pasoCheckout === "datos" && (
                        <>
                        <div className="p-4 space-y-3">
                            {avisoStock && (
                                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                    {avisoStock}
                                </p>
                            )}
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
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={it.cantidad}
                                            onChange={(e) =>
                                                escribirCantidad(
                                                    it.producto.id,
                                                    e.target.value,
                                                )
                                            }
                                            onBlur={() =>
                                                confirmarCantidadEscrita(
                                                    it.producto.id,
                                                )
                                            }
                                            className="text-sm font-semibold w-10 text-center border border-gray-200 rounded-lg py-1 bg-white"
                                        />
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
                                        onChange={(e) => {
                                            const nuevoTipo = e.target.value;
                                            const maxLargo =
                                                nuevoTipo === "RUC" ? 11 : 8;
                                            setForm((prev) => ({
                                                ...prev,
                                                documentType: nuevoTipo,
                                                docNumber: prev.docNumber.slice(
                                                    0,
                                                    maxLargo,
                                                ),
                                            }));
                                        }}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                    >
                                        <option value="DNI">DNI</option>
                                        <option value="RUC">RUC</option>
                                    </select>
                                    <div>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={
                                                form.documentType === "RUC" ? 11 : 8
                                            }
                                            placeholder={
                                                form.documentType === "RUC"
                                                    ? "N° de RUC *"
                                                    : "N° de DNI *"
                                            }
                                            value={form.docNumber}
                                            onChange={(e) =>
                                                actualizarDocNumber(e.target.value)
                                            }
                                            className={`w-full px-3 py-2 rounded-lg border text-sm ${errores.docNumber ? "border-red-400" : "border-gray-200"}`}
                                        />
                                        {errores.docNumber && (
                                            <p className="text-xs text-red-500 mt-0.5">
                                                {errores.docNumber}
                                            </p>
                                        )}
                                        {!errores.docNumber && verificandoDoc && (
                                            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                                <Loader2 size={11} className="animate-spin" />
                                                Verificando...
                                            </p>
                                        )}
                                        {!errores.docNumber &&
                                            !verificandoDoc &&
                                            estadoDoc === "cliente" && (
                                                <p className="text-xs text-cixoil-green mt-0.5">
                                                    ✓ Te reconocimos, completamos tus datos
                                                </p>
                                            )}
                                        {!errores.docNumber &&
                                            !verificandoDoc &&
                                            estadoDoc === "verificado" && (
                                                <p className="text-xs text-cixoil-green mt-0.5">
                                                    ✓ Documento verificado
                                                </p>
                                            )}
                                        {!errores.docNumber &&
                                            !verificandoDoc &&
                                            estadoDoc === "no-verificado" && (
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    No pudimos verificarlo automáticamente, revisa que esté bien
                                                </p>
                                            )}
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={9}
                                            placeholder="Teléfono *"
                                            value={form.phoneNumber}
                                            onChange={(e) =>
                                                actualizarTelefono(e.target.value)
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
                                    onClick={irAPago}
                                    className="w-full py-3 rounded-xl bg-cixoil-red text-white font-bold hover:opacity-90 flex items-center justify-center gap-2"
                                >
                                    Continuar al pago
                                </button>
                            </div>
                        )}
                        </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

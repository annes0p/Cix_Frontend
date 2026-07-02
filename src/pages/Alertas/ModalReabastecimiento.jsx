import {
    AlertTriangle,
    Loader2,
    Package,
    ShoppingCart,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { crearOrden, getOrdenes } from "../../services/ordenesService";
import {
    getProductosDeProveedor,
    getProveedores,
} from "../../services/proveedoresService";

const DIAS_OBJETIVO = 30;
const DIAS_ENTREGA_ESTIMADA = 7;
const NIVELES_QUE_NECESITAN_COMPRA = ["agotado", "critico", "advertencia"];

const calcularCantidadYaPedidaPorProducto = (ordenes) => {
    const pendientePorProducto = {};
    ordenes
        .filter((orden) => orden.receptionStatus !== "RECEIVED")
        .forEach((orden) => {
            (orden.details || []).forEach((detalle) => {
                const idProduct = detalle.product?.id;
                if (!idProduct) return;
                const cantidadPendiente =
                    (detalle.quantity || 0) - (detalle.receivedQuantity || 0);
                if (cantidadPendiente <= 0) return;
                pendientePorProducto[idProduct] =
                    (pendientePorProducto[idProduct] || 0) + cantidadPendiente;
            });
        });
    return pendientePorProducto;
};

const calcularCantidadSugerida = (alerta, yaPedido) => {
    const consumoDiario = parseFloat(alerta.consumoDiario) || 0;
    const objetivoPorConsumo = Math.ceil(consumoDiario * DIAS_OBJETIVO);
    const objetivoPorMinimo = (alerta.minStock || 0) * 2;
    const objetivo = Math.max(objetivoPorConsumo, objetivoPorMinimo);
    return Math.max(0, objetivo - alerta.stock - yaPedido);
};

export default function ModalReabastecimiento({ alertas, onClose, onGenerado }) {
    const [cargando, setCargando] = useState(true);
    const [grupos, setGrupos] = useState([]);
    const [sinProveedor, setSinProveedor] = useState([]);
    const [yaCubiertos, setYaCubiertos] = useState([]);
    const [generando, setGenerando] = useState(false);
    const [resultado, setResultado] = useState(null);
    const [errorApi, setErrorApi] = useState(null);

    useEffect(() => {
        const armarSugerencias = async () => {
            try {
                setCargando(true);
                setErrorApi(null);

                const [proveedores, ordenes] = await Promise.all([
                    getProveedores(),
                    getOrdenes(),
                ]);

                const yaPedidoPorProducto = calcularCantidadYaPedidaPorProducto(ordenes);

                const mapaProductoProveedor = {};
                for (const proveedor of proveedores) {
                    const productos = await getProductosDeProveedor(proveedor.id);
                    productos.forEach((producto) => {
                        if (!mapaProductoProveedor[producto.id]) {
                            mapaProductoProveedor[producto.id] = proveedor;
                        }
                    });
                }

                const candidatos = alertas.filter((a) =>
                    NIVELES_QUE_NECESITAN_COMPRA.includes(a.nivelRiesgo),
                );

                const gruposPorProveedor = {};
                const sinAsignar = [];
                const cubiertos = [];

                candidatos.forEach((alerta) => {
                    const yaPedido = yaPedidoPorProducto[alerta.product?.id] || 0;
                    const cantidadSugerida = calcularCantidadSugerida(alerta, yaPedido);

                    if (cantidadSugerida <= 0) {
                        if (yaPedido > 0) cubiertos.push(alerta);
                        return;
                    }

                    const proveedor = mapaProductoProveedor[alerta.product?.id];
                    if (!proveedor) {
                        sinAsignar.push(alerta);
                        return;
                    }

                    if (!gruposPorProveedor[proveedor.id]) {
                        gruposPorProveedor[proveedor.id] = {
                            proveedor,
                            items: [],
                        };
                    }
                    gruposPorProveedor[proveedor.id].items.push({
                        idProduct: alerta.product?.id,
                        nombre: alerta.product?.name,
                        cantidad: cantidadSugerida,
                    });
                });

                setGrupos(Object.values(gruposPorProveedor));
                setSinProveedor(sinAsignar);
                setYaCubiertos(cubiertos);
            } catch (err) {
                console.error("Error al armar sugerencias de reabastecimiento:", err);
                setErrorApi(
                    "No se pudieron cargar los proveedores para armar las sugerencias.",
                );
            } finally {
                setCargando(false);
            }
        };

        armarSugerencias();
    }, [alertas]);

    const actualizarCantidad = (indiceGrupo, idProduct, valor) => {
        const num = parseInt(valor, 10);
        setGrupos((prev) =>
            prev.map((grupo, i) =>
                i !== indiceGrupo
                    ? grupo
                    : {
                          ...grupo,
                          items: grupo.items.map((item) =>
                              item.idProduct !== idProduct
                                  ? item
                                  : {
                                        ...item,
                                        cantidad: isNaN(num) ? 0 : Math.max(0, num),
                                    },
                          ),
                      },
            ),
        );
    };

    const generarOrdenes = async () => {
        setGenerando(true);
        setErrorApi(null);
        const hoy = new Date().toLocaleDateString("sv-SE");
        const entregaEstimada = new Date();
        entregaEstimada.setDate(entregaEstimada.getDate() + DIAS_ENTREGA_ESTIMADA);
        const entregaEstimadaStr = entregaEstimada.toLocaleDateString("sv-SE");
        let creadas = 0;
        let fallidas = 0;

        for (const grupo of grupos) {
            const items = grupo.items.filter((item) => item.cantidad > 0);
            if (!items.length) continue;

            try {
                await crearOrden({
                    idSupplier: grupo.proveedor.id,
                    purchasedAt: hoy,
                    estimatedDeliveryAt: entregaEstimadaStr,
                    deliveredAt: null,
                    details: items.map((item) => ({
                        idProduct: item.idProduct,
                        quantity: item.cantidad,
                    })),
                });
                creadas++;
            } catch (err) {
                console.error(
                    `Error al crear orden sugerida para ${grupo.proveedor.legalName}:`,
                    err,
                );
                fallidas++;
            }
        }

        setGenerando(false);
        setResultado({ creadas, fallidas });
        if (creadas > 0) onGenerado?.();
    };

    const totalProductos = grupos.reduce(
        (acc, grupo) => acc + grupo.items.filter((i) => i.cantidad > 0).length,
        0,
    );

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                    <div>
                        <h2 className="font-bold text-lg text-gray-900">
                            Reabastecimiento sugerido
                        </h2>
                        <p className="text-sm text-gray-500">
                            Calculado a partir del consumo diario de cada producto en
                            riesgo
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                    {errorApi && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                            {errorApi}
                        </div>
                    )}

                    {cargando && (
                        <div className="flex flex-col items-center justify-center gap-2 py-10 text-gray-400">
                            <Loader2
                                size={24}
                                className="animate-spin text-cixoil-red"
                            />
                            <span className="text-sm">
                                Calculando sugerencias...
                            </span>
                        </div>
                    )}

                    {!cargando && resultado && (
                        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
                            Se generaron {resultado.creadas} orden
                            {resultado.creadas !== 1 ? "es" : ""} de compra
                            {resultado.fallidas > 0
                                ? `. ${resultado.fallidas} no se pudieron crear, revisa la consola.`
                                : " correctamente. Revisalas en Ordenes de Compra."}
                        </div>
                    )}

                    {!cargando &&
                        !resultado &&
                        grupos.length === 0 &&
                        sinProveedor.length === 0 &&
                        yaCubiertos.length === 0 && (
                            <div className="bg-gray-50 rounded-xl p-6 text-center">
                                <p className="text-sm text-gray-500">
                                    No hay productos en riesgo que necesiten
                                    reabastecimiento ahora mismo.
                                </p>
                            </div>
                        )}

                    {!cargando &&
                        !resultado &&
                        grupos.length === 0 &&
                        sinProveedor.length === 0 &&
                        yaCubiertos.length > 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <p className="text-sm text-blue-700">
                                    Los productos en riesgo ya tienen una orden de
                                    compra pendiente que cubre lo necesario, no hace
                                    falta generar otra todavia.
                                </p>
                            </div>
                        )}

                    {!cargando &&
                        !resultado &&
                        grupos.length > 0 &&
                        yaCubiertos.length > 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                                <p className="text-xs text-blue-700">
                                    {yaCubiertos.length} producto
                                    {yaCubiertos.length !== 1 ? "s" : ""} en riesgo
                                    ya tiene{yaCubiertos.length === 1 ? "" : "n"} una
                                    orden pendiente que cubre lo necesario, no se
                                    incluye{yaCubiertos.length === 1 ? "" : "n"} de
                                    nuevo (
                                    {yaCubiertos
                                        .map((a) => a.product?.name)
                                        .join(", ")}
                                    ).
                                </p>
                            </div>
                        )}

                    {!cargando &&
                        !resultado &&
                        grupos.map((grupo, index) => (
                            <div
                                key={grupo.proveedor.id}
                                className="border border-gray-200 rounded-xl overflow-hidden"
                            >
                                <div className="bg-gray-50 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
                                    <ShoppingCart
                                        size={16}
                                        className="text-cixoil-red"
                                    />
                                    <p className="font-semibold text-sm text-gray-800">
                                        {grupo.proveedor.legalName}
                                    </p>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {grupo.items.map((item) => (
                                        <div
                                            key={item.idProduct}
                                            className="flex items-center justify-between px-4 py-2.5 gap-3"
                                        >
                                            <p className="text-sm text-gray-700 flex-1 min-w-0 truncate">
                                                {item.nombre}
                                            </p>
                                            <input
                                                type="number"
                                                min="0"
                                                value={item.cantidad}
                                                onChange={(e) =>
                                                    actualizarCantidad(
                                                        index,
                                                        item.idProduct,
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-20 text-center border border-gray-300 rounded-lg px-2 py-1.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-cixoil-red"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                    {!cargando && !resultado && sinProveedor.length > 0 && (
                        <div className="border border-yellow-200 bg-yellow-50 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle
                                    size={16}
                                    className="text-yellow-600"
                                />
                                <p className="text-sm font-semibold text-yellow-700">
                                    Sin proveedor asignado
                                </p>
                            </div>
                            <p className="text-xs text-yellow-700 mb-2">
                                Estos productos necesitan reposicion pero no tienen
                                un proveedor asociado, asignalo desde Proveedores
                                para poder incluirlos en una orden.
                            </p>
                            <ul className="text-xs text-gray-600 space-y-1">
                                {sinProveedor.map((alerta) => (
                                    <li
                                        key={alerta.product?.id}
                                        className="flex items-center gap-1.5"
                                    >
                                        <Package size={12} />
                                        {alerta.product?.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 border border-gray-300 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        {resultado ? "Cerrar" : "Cancelar"}
                    </button>
                    {!resultado && (
                        <button
                            onClick={generarOrdenes}
                            disabled={generando || cargando || totalProductos === 0}
                            className="flex-1 bg-cixoil-red text-white rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {generando
                                ? "Generando..."
                                : `Generar ${grupos.length} orden${
                                      grupos.length !== 1 ? "es" : ""
                                  } de compra`}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

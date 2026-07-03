export default function TopProducts({ ventas }) {
    // Cuenta unidades vendidas por producto, solo de ventas completadas
    // (las canceladas no representan una venta real).
    const cantidadPorProducto = {};

    (ventas || [])
        .filter((v) => v.transactionStatus === "COMPLETED")
        .forEach((venta) => {
            (venta.details || []).forEach((detalle) => {
                const idProducto = detalle.product?.id;
                if (!idProducto) return;

                if (!cantidadPorProducto[idProducto]) {
                    cantidadPorProducto[idProducto] = {
                        nombre: detalle.product?.name || "-",
                        cantidad: 0,
                    };
                }
                cantidadPorProducto[idProducto].cantidad +=
                    detalle.quantity || 0;
            });
        });

    const top = Object.entries(cantidadPorProducto)
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 5);

    if (!top.length) {
        return (
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full flex flex-col justify-center items-center gap-2">
                <p className="text-sm font-bold text-gray-400">
                    Sin ventas registradas
                </p>
            </div>
        );
    }

    const maxCantidad = Math.max(...top.map((p) => p.cantidad));

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-cixoil-red">
                    Top productos mas vendidos
                </h3>
            </div>

            <div className="space-y-4 flex-1">
                {top.map((item, idx) => (
                    <div key={item.id} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-cixoil-red text-white text-[10px] font-black flex items-center justify-center shrink-0">
                                    {idx + 1}
                                </span>
                                <span className="font-semibold text-gray-800 truncate max-w-[140px]">
                                    {item.nombre}
                                </span>
                            </div>
                            <span className="font-black text-gray-900 shrink-0">
                                {item.cantidad}
                            </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div
                                className="bg-cixoil-red h-1.5 rounded-full transition-all"
                                style={{
                                    width: `${(item.cantidad / maxCantidad) * 100}%`,
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

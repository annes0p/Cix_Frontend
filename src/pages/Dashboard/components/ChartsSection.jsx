import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

export default function ChartsSection({ movimientos, ventas }) {
    const ventasPorDia = ventas?.reduce((acc, venta) => {
        const fecha = venta.saleDate
            ? new Date(venta.saleDate).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' })
            : 'Sin fecha';
        const existing = acc.find((d) => d.name === fecha);
        if (existing) {
            existing.ventas += 1;
        } else {
            acc.push({ name: fecha, ventas: 1 });
        }
        return acc;
    }, []).slice(-7) || [];

    const movimientosPorTipo = movimientos?.reduce((acc, mov) => {
        const tipo = mov.stockMovementType === 'OUT' ? 'Salida' : mov.stockMovementType === 'IN' ? 'Entrada' : 'Otro';
        const existing = acc.find((d) => d.name === tipo);
        if (existing) {
            existing.value += 1;
        } else {
            acc.push({ name: tipo, value: 1 });
        }
        return acc;
    }, []) || [];

    const COLORS = ['#660000', '#2E7D32', '#A6A6A6', '#D1A319', '#4D4D4D'];

    const sinDatosVentas = ventasPorDia.length === 0;
    const sinDatosMovimientos = movimientosPorTipo.length === 0;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold text-cixoil-red">Ventas por dia</h3>
                </div>

                {sinDatosVentas ? (
                    <div className="h-64 flex items-center justify-center">
                        <p className="text-sm text-gray-400">Sin datos de ventas disponibles</p>
                    </div>
                ) : (
                    <div className="w-full h-64 text-[10px] font-bold">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={ventasPorDia} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#2E7D32" stopOpacity={0.01} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                                <XAxis dataKey="name" stroke="#9CA3AF" tickLine={false} axisLine={false} />
                                <YAxis stroke="#9CA3AF" tickLine={false} axisLine={false} allowDecimals={false} />
                                <Tooltip />
                                <Area
                                    type="monotone"
                                    dataKey="ventas"
                                    name="Ventas"
                                    stroke="#2E7D32"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorVentas)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                <h3 className="text-sm font-bold text-cixoil-red mb-4">Movimientos por tipo</h3>

                {sinDatosMovimientos ? (
                    <div className="h-40 flex items-center justify-center">
                        <p className="text-sm text-gray-400">Sin datos de movimientos</p>
                    </div>
                ) : (
                    <>
                        <div className="relative w-full h-40 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={movimientosPorTipo}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={68}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {movimientosPorTipo.map((entry, idx) => (
                                            <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute text-center flex flex-col justify-center">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Total</span>
                                <span className="text-sm font-black text-gray-900 tracking-tight">{movimientos?.length}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-semibold px-2 mt-2">
                            {movimientosPorTipo.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between border-b border-gray-50 pb-1">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <span
                                            className="w-2 h-2 rounded-full shrink-0"
                                            style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                                        />
                                        <span className="truncate max-w-[80px]">{item.name}</span>
                                    </div>
                                    <span className="text-gray-950 font-bold">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
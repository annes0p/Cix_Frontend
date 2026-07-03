export default function TopProducts({ inventario }) {
    const top =
        inventario
            ?.slice()
            .sort((a, b) => b.stock - a.stock)
            .slice(0, 5) || [];

    if (!top.length) {
        return (
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full flex flex-col justify-center items-center gap-2">
                <p className="text-sm font-bold text-gray-400">
                    Sin datos de productos
                </p>
            </div>
        );
    }

    const maxStock = Math.max(...top.map((p) => p.stock));

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-cixoil-red">
                    Top productos por stock
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
                                    {item.product?.name}
                                </span>
                            </div>
                            <span className="font-black text-gray-900 shrink-0">
                                {item.stock}
                            </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div
                                className="bg-cixoil-red h-1.5 rounded-full transition-all"
                                style={{
                                    width: `${(item.stock / maxStock) * 100}%`,
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

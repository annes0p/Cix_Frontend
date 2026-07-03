export default function ReportesFiltros({ tipoActivo, onCambiarTipo }) {
    const tipos = ["Inventario", "Movimientos", "Compras"];

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
                {tipos.map((tipo) => (
                    <button
                        key={tipo}
                        onClick={() => onCambiarTipo(tipo)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            tipoActivo === tipo
                                ? "bg-cixoil-red text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                        {tipo}
                    </button>
                ))}
            </div>
        </div>
    );
}

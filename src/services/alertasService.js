import api from "./api";

export const getInventario = async () => {
    const response = await api.get("/inventory");
    return response.data.data || response.data;
};

export const getMovimientos = async () => {
    const response = await api.get("/movements");
    return response.data.data || response.data;
};

export const calcularPrediccion = (inventario, movimientos) => {
    return inventario.map((item) => {
        const movimientosProducto = movimientos.filter(
            (m) =>
                m.product?.id === item.product?.id &&
                m.stockMovementType === "OUT",
        );

        const totalSalidas = movimientosProducto.reduce(
            (acc, m) => acc + (m.quantity || 0),
            0,
        );

        const diasConMovimiento =
            movimientosProducto.length > 0
                ? [
                      ...new Set(
                          movimientosProducto.map(
                              (m) => m.movementDate?.split("T")[0],
                          ),
                      ),
                  ].length
                : 0;

        const consumoDiario =
            diasConMovimiento > 0 ? totalSalidas / diasConMovimiento : 0;

        const diasHastaAgotamiento =
            consumoDiario > 0 ? Math.floor(item.stock / consumoDiario) : null;

        let nivelRiesgo = "normal";
        if (item.stock === 0) nivelRiesgo = "agotado";
        else if (item.stock <= item.minStock) nivelRiesgo = "critico";
        else if (diasHastaAgotamiento !== null && diasHastaAgotamiento <= 7)
            nivelRiesgo = "advertencia";

        return {
            ...item,
            consumoDiario: consumoDiario.toFixed(2),
            diasHastaAgotamiento,
            nivelRiesgo,
        };
    });
};

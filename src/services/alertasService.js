import api from "./api";

export const getInventario = async () => {
    const response = await api.get("/inventory");
    return response.data.data || response.data;
};

export const getMovimientos = async () => {
    const response = await api.get("/movements");
    return response.data.data || response.data;
};

const VENTANA_RECIENTE = 14; // dias
const VENTANA_ANTERIOR = 14; // dias previos a la ventana reciente
const VENTANA_ROTACION = 30; // dias para considerar baja rotacion

const sumarSalidasEnRango = (movimientos, productId, desde, hasta) => {
    return movimientos
        .filter((m) => {
            if (m.product?.id !== productId) return false;
            if (m.stockMovementType !== "OUT") return false;
            const fecha = new Date(m.movementDate);
            return fecha >= desde && fecha < hasta;
        })
        .reduce((acc, m) => acc + (m.quantity || 0), 0);
};

export const calcularPrediccion = (inventario, movimientos) => {
    const ahora = new Date();
    const inicioReciente = new Date(ahora);
    inicioReciente.setDate(inicioReciente.getDate() - VENTANA_RECIENTE);

    const inicioAnterior = new Date(inicioReciente);
    inicioAnterior.setDate(inicioAnterior.getDate() - VENTANA_ANTERIOR);

    const inicioRotacion = new Date(ahora);
    inicioRotacion.setDate(inicioRotacion.getDate() - VENTANA_ROTACION);

    return inventario.map((item) => {
        const productId = item.product?.id;

        // Consumo en ventana reciente (ultimos 14 dias)
        const salidasRecientes = sumarSalidasEnRango(
            movimientos,
            productId,
            inicioReciente,
            ahora,
        );
        const consumoDiario = salidasRecientes / VENTANA_RECIENTE;

        // Consumo en ventana anterior (14 dias previos) para tendencia
        const salidasAnteriores = sumarSalidasEnRango(
            movimientos,
            productId,
            inicioAnterior,
            inicioReciente,
        );
        const consumoDiarioAnterior = salidasAnteriores / VENTANA_ANTERIOR;

        // Tendencia: comparacion porcentual entre ventanas
        let tendencia = "estable";
        let tendenciaPorcentaje = 0;
        if (consumoDiarioAnterior === 0 && consumoDiario > 0) {
            tendencia = "subiendo";
            tendenciaPorcentaje = 100;
        } else if (consumoDiarioAnterior > 0) {
            const cambio =
                ((consumoDiario - consumoDiarioAnterior) /
                    consumoDiarioAnterior) *
                100;
            tendenciaPorcentaje = Math.round(cambio);
            if (cambio >= 15) tendencia = "subiendo";
            else if (cambio <= -15) tendencia = "bajando";
        }

        // Dias hasta agotamiento, basado en consumo reciente
        const diasHastaAgotamiento =
            consumoDiario > 0 ? Math.floor(item.stock / consumoDiario) : null;

        // Baja rotacion: hay stock pero no se vendio nada en 30 dias
        const salidasRotacion = sumarSalidasEnRango(
            movimientos,
            productId,
            inicioRotacion,
            ahora,
        );
        const bajaRotacion = item.stock > 0 && salidasRotacion === 0;

        // Nivel de riesgo (prioridad: agotado > critico > advertencia > baja_rotacion > normal)
        let nivelRiesgo = "normal";
        if (item.stock === 0) nivelRiesgo = "agotado";
        else if (item.stock <= item.minStock) nivelRiesgo = "critico";
        else if (diasHastaAgotamiento !== null && diasHastaAgotamiento <= 7)
            nivelRiesgo = "advertencia";
        else if (bajaRotacion) nivelRiesgo = "baja_rotacion";

        return {
            ...item,
            consumoDiario: consumoDiario.toFixed(2),
            diasHastaAgotamiento,
            nivelRiesgo,
            tendencia,
            tendenciaPorcentaje,
            bajaRotacion,
        };
    });
};

import api from "./api";
export const getClientes = async () => {
    const response = await api.get("/clients");
    return response.data.data || response.data;
};
export const getVentas = async () => {
    const response = await api.get("/sales");
    return response.data.data || response.data;
};

export const confirmarPagoVenta = async (idSale, paymentMethod) => {
    const response = await api.patch(`/sales/${idSale}/confirm-payment`, {
        paymentMethod,
    });
    return response.data.data || response.data;
};
export const construirCRM = (clientes, ventas) => {
    return clientes.map((cliente) => {
        const ventasCliente = ventas.filter((v) => v.client?.id === cliente.id);
        const totalGastado = ventasCliente.reduce(
            (acc, v) => acc + (v.total || 0),
            0,
        );
        const ultimaCompra =
            ventasCliente.length > 0
                ? ventasCliente.sort(
                      (a, b) => new Date(b.saleDate) - new Date(a.saleDate),
                  )[0].saleDate
                : null;
        const frecuencia = ventasCliente.length;
        let segmento = "Nuevo";
        if (frecuencia >= 2) segmento = "Frecuente";
        else if (frecuencia === 1) segmento = "Ocasional";
        return {
            ...cliente,
            ventasCliente,
            totalGastado,
            ultimaCompra,
            frecuencia,
            segmento,
        };
    });
};

import api from "./api";

export const dashboardService = {
    getSummaryData: async () => {
        try {
            const [salesRes, inventoryRes] = await Promise.all([
                api.get("/sales"),
                api.get("/inventory"),
            ]);

            const sales = salesRes.data?.data || salesRes.data || [];
            const inventory =
                inventoryRes.data?.data || inventoryRes.data || [];

            const estadoMap = {
                PENDING: "Pendiente",
                COMPLETED: "Completada",
                CANCELED: "Cancelada",
            };

            const pagoMap = {
                YAPE: "Yape",
                CASH: "Efectivo",
                CARD: "Tarjeta",
                TRANSFER: "Transferencia",
            };

            const totalVentas = sales.reduce(
                (s, v) => s + Number(v.total || 0),
                0,
            );
            const numVentas = sales.length;
            const ticketPromedio =
                numVentas > 0 ? Math.round(totalVentas / numVentas) : 0;
            const clientesUnicos = new Set(
                sales.map((v) => v.client?.id).filter(Boolean),
            ).size;
            const productosVendidos = sales.reduce(
                (s, v) =>
                    s +
                    (v.details?.reduce(
                        (a, d) => a + Number(d.quantity || 0),
                        0,
                    ) || 0),
                0,
            );

            const ultimasVentas = sales.slice(0, 5).map((v, i) => {
                const clienteNombre = v.client
                    ? `${v.client.name || ""} ${v.client.fatherLastName || ""}`.trim()
                    : "Cliente desconocido";
                return {
                    id: i + 1,
                    num: v.series
                        ? `${v.series}-${v.number || String(i + 1).padStart(4, "0")}`
                        : `VEN-${String(i + 1).padStart(4, "0")}`,
                    client: clienteNombre,
                    date: v.saleDate
                        ? new Date(v.saleDate).toLocaleDateString("es-CO")
                        : "-",
                    time: v.saleDate
                        ? new Date(v.saleDate).toLocaleTimeString("es-CO", {
                              hour: "2-digit",
                              minute: "2-digit",
                          })
                        : "-",
                    total: `$ ${Number(v.total || 0).toLocaleString("es-CO")}`,
                    seller: v.user
                        ? `${v.user.name || ""} ${v.user.lastName || ""}`.trim()
                        : "-",
                    status:
                        estadoMap[v.transactionStatus] ||
                        v.transactionStatus ||
                        "Pendiente",
                };
            });

            const stockCritico = inventory
                .filter((item) => {
                    const current = Number(
                        item.currentStock ?? item.stockActual ?? 0,
                    );
                    const min = Number(
                        item.minimumStock ?? item.stockMinimo ?? 0,
                    );
                    return current <= min;
                })
                .slice(0, 5)
                .map((item, i) => ({
                    id: i + 1,
                    name: item.product?.name || item.nombre || "Producto",
                    detail:
                        item.product?.presentation || item.presentacion || "-",
                    code: item.product?.code || item.codigo || "-",
                    warehouse: item.warehouse?.name || item.almacen || "Bodega",
                    current: Number(item.currentStock ?? item.stockActual ?? 0),
                    min: Number(item.minimumStock ?? item.stockMinimo ?? 0),
                    status:
                        Number(item.currentStock ?? item.stockActual ?? 0) === 0
                            ? "Sin stock"
                            : "Stock bajo",
                }));

            return {
                totalSales: `$ ${totalVentas.toLocaleString("es-CO")}`,
                salesCount: numVentas,
                averageTicket: `$ ${ticketPromedio.toLocaleString("es-CO")}`,
                newClients: clientesUnicos,
                productsSold: productosVendidos,
                ultimasVentas,
                stockCritico,
            };
        } catch (error) {
            throw (
                error.response?.data?.message ||
                "Error al cargar los datos del Dashboard"
            );
        }
    },
};

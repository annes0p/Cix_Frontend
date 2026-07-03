import api from "../api/axios";

export const dashboardService = {
    getInventario: async () => {
        const response = await api.get("/inventory");
        return response.data.data || response.data;
    },
    getMovimientos: async () => {
        const response = await api.get("/movements");
        return response.data.data || response.data;
    },
    getVentas: async () => {
        const response = await api.get("/sales");
        return response.data.data || response.data;
    },
    getClientes: async () => {
        const response = await api.get("/clients");
        return response.data.data || response.data;
    },
};
